import { useState, useEffect } from 'react';
import './App.css';
import StaffManager from './components/StaffManager';
import CommissionCalculator from './components/CommissionCalculator';
import Login from './components/Login';
import { supabase } from './supabaseClient';
import kimmyLogo from './assets/Kimmy_logo.png';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Data State
  const [staff, setStaff] = useState([]);
  const [entries, setEntries] = useState([]);
  const [activeTab, setActiveTab] = useState('tracker');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Data when session exists
  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    // Fetch Staff
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('name')
      .order('name');

    if (staffData) setStaff(staffData.map(s => s.name));

    // Fetch Entries
    const { data: entriesData, error: entriesError } = await supabase
      .from('entries')
      .select('*')
      .order('timestamp', { ascending: true });

    if (entriesData) setEntries(entriesData);
  };

  // Handlers
  const addStaff = async (name) => {
    if (!staff.includes(name)) {
      const { error } = await supabase
        .from('staff')
        .insert([{ name, user_id: session.user.id }]);

      if (!error) {
        setStaff([...staff, name]);
      } else {
        alert('Error saving staff: ' + error.message);
      }
    } else {
      alert('Staff member already exists!');
    }
  };

  const removeStaff = async (name) => {
    if (confirm(`Are you sure you want to remove ${name}?`)) {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('name', name);

      if (!error) {
        setStaff(staff.filter(s => s !== name));
      } else {
        alert('Error removing staff: ' + error.message);
      }
    }
  };

  const editStaff = async (oldName, newName) => {
    if (!newName.trim() || staff.includes(newName)) {
      alert('Invalid name or name already exists!');
      return;
    }
    const updatedName = newName.trim();

    // 1. Update Staff Table
    const { error: staffError } = await supabase
      .from('staff')
      .update({ name: updatedName })
      .eq('name', oldName);

    if (staffError) {
      alert('Error updating staff name: ' + staffError.message);
      return;
    }

    // 2. Update Entries Table (for history)
    const { error: entriesError } = await supabase
      .from('entries')
      .update({ staff_name: updatedName })
      .eq('staff_name', oldName);

    // Update Local State
    setStaff(staff.map(s => s === oldName ? updatedName : s));
    setEntries(entries.map(e => (e.staff_name === oldName || e.staffName === oldName) ? { ...e, staff_name: updatedName, staffName: updatedName } : e));
  };

  const addEntry = async (entry) => {
    // Transform to DB schema
    const dbEntry = {
      staff_name: entry.staffName,
      sales_amount: entry.salesAmount,
      timestamp: entry.timestamp,
      user_id: session.user.id
    };

    const { data, error } = await supabase
      .from('entries')
      .insert([dbEntry])
      .select();

    if (!error && data) {
      // Map back to UI model
      const newEntry = {
        ...data[0],
        staffName: data[0].staff_name,
        salesAmount: data[0].sales_amount
      };
      setEntries([...entries, newEntry]);
    } else {
      alert('Error saving entry: ' + error.message);
    }
  };

  const deleteEntry = async (id) => {
    if (confirm('Delete this entry?')) {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id);

      if (!error) {
        setEntries(entries.filter(e => e.id !== id));
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div className="container"><p>Loading...</p></div>;
  }

  if (!session) {
    return <Login />;
  }

  // Normalize entries for UI (DB snake_case -> UI camelCase)
  const uiEntries = entries.map(e => ({
    ...e,
    staffName: e.staff_name || e.staffName,
    salesAmount: e.sales_amount || e.salesAmount
  }));

  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button
            onClick={handleLogout}
            style={{ fontSize: '0.8rem', background: 'transparent', color: '#666', border: '1px solid #ddd', padding: '6px 12px', borderRadius: '20px' }}
          >
            Sign Out
          </button>
        </div>
        <img
          src={kimmyLogo}
          alt="Kimmy's Beauty Bar Logo"
          style={{ width: '150px', marginBottom: '20px' }}
        />
        <h1 style={{ color: 'var(--color-primary)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Kimmy's Beauty Bar</h1>
        <p style={{ color: 'var(--color-text-light)', margin: 0 }}>Commission Tracker</p>
      </header>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('tracker')}
          className={activeTab === 'tracker' ? 'btn-primary' : 'btn-secondary'}
        >
          Commission Tracker
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={activeTab === 'staff' ? 'btn-primary' : 'btn-secondary'}
        >
          Manage Staff
        </button>
      </div>

      <main>
        {activeTab === 'tracker' ? (
          <CommissionCalculator
            staff={staff}
            entries={uiEntries}
            onAddEntry={addEntry}
            onDeleteEntry={deleteEntry}
          />
        ) : (
          <StaffManager
            staff={staff}
            onAddStaff={addStaff}
            onRemoveStaff={removeStaff}
            onEditStaff={editStaff}
          />
        )}
      </main>

      <footer style={{ textAlign: 'center', marginTop: '3rem', color: '#999', fontSize: '0.8rem' }}>
        <p>© {new Date().getFullYear()} Kimmy's Beauty Bar. Data saved to Cloud.</p>
      </footer>
    </div>
  );
}

export default App;
