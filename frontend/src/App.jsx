import { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './index.css';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';

function App() {
  const [wallet, setWallet] = useState(null);
  const [buses, setBuses] = useState([]);
  const userId = 1;

  const fetchWallet = async () => {
    try {
      const res = await axios.get(`${API}/wallet/${userId}`);
      setWallet(res.data.wallet);
    } catch (e) {
      console.error(e);
    }
  };

  const topUp = async () => {
    await axios.post(`${API}/wallet/topup`, { user_id: userId, amount: 200 });
    fetchWallet();
  };

  const deductFare = async () => {
    await axios.post(`${API}/transaction`, { user_id: userId, amount: 15 });
    fetchWallet();
  };

  const fetchBuses = async () => {
    try {
      const res = await axios.get(`${API}/bus/latest`);
      if (res.data && res.data.buses) setBuses(res.data.buses);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchWallet();
    const id = setInterval(fetchBuses, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ textAlign: 'center' }}>🚌 BMTC Smart Bus Dashboard</h1>
      {wallet && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <div>💳 Balance: ₹{wallet.balance.toFixed(2)}</div>
          <button onClick={topUp}>Top Up ₹200</button>
          <button onClick={deductFare}>Deduct ₹15</button>
        </div>
      )}
      <MapContainer center={[12.9716, 77.5946]} zoom={13} style={{ height: '500px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {buses.map((bus, i) => (
          <Marker key={i} position={[bus.latitude, bus.longitude]}>
            <Popup>{bus.bus_id} 🚍 | Speed: {bus.speed}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default App;
