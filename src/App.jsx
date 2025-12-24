import { useState, useEffect } from 'react';
import { Spin, ConfigProvider } from "antd";
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StaffManager from './components/StaffManager';
import Login from './components/Login';
import CalendarTab from './components/CalendarTab';
import Notes from './components/Notes';
import { supabase } from './supabaseClient';
import './dayjsConfig';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Data State
  const [staff, setStaff] = useState([]);
  const [entries, setEntries] = useState([]);
  const [activeTab, setActiveTab] = useState("tracker");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Data
  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    // Fetch Staff
    const { data: staffData } = await supabase.from('staff').select('name').order('name');
    if (staffData) setStaff(staffData.map(s => s.name));

    // Fetch Entries
    const { data: entriesData } = await supabase.from('entries').select('*').order('timestamp', { ascending: true });
    if (entriesData) setEntries(entriesData);
  };

  // Handlers
  const addStaff = async (name) => {
    if (!staff.includes(name)) {
      const { error } = await supabase.from('staff').insert([{ name, user_id: session.user.id }]);
      if (!error) setStaff([...staff, name]);
      else alert('Error: ' + error.message);
    } else alert('Staff member already exists!');
  };

  const removeStaff = async (name) => {
    if (confirm(`Remove ${name}?`)) {
      const { error } = await supabase.from('staff').delete().eq('name', name);
      if (!error) setStaff(staff.filter(s => s !== name));
      else alert('Error: ' + error.message);
    }
  };

  const editStaff = async (oldName, newName) => {
    if (!newName.trim() || staff.includes(newName)) return;
    const updatedName = newName.trim();
    const { error } = await supabase.from('staff').update({ name: updatedName }).eq('name', oldName);
    if (!error) {
      await supabase.from('entries').update({ staff_name: updatedName }).eq('staff_name', oldName);
      setStaff(staff.map(s => s === oldName ? updatedName : s));
      setEntries(entries.map(e => (e.staff_name === oldName || e.staffName === oldName) ? { ...e, staff_name: updatedName, staffName: updatedName } : e));
    }
  };

  const addEntry = async (entry) => {
    const dbEntry = {
      staff_name: entry.staffName,
      sales_amount: entry.salesAmount,
      timestamp: entry.timestamp,
      commission_rate: entry.commissionRate,
      service_type: entry.serviceType,
      user_id: session.user.id
    };
    const { data, error } = await supabase.from('entries').insert([dbEntry]).select();
    if (!error && data) {
      const newEntry = {
        ...data[0],
        staffName: data[0].staff_name,
        salesAmount: data[0].sales_amount,
        commissionRate: data[0].commission_rate,
        serviceType: data[0].service_type
      };
      setEntries([...entries, newEntry]);
    } else alert('Error: ' + error.message);
  };

  const editEntry = async (entry) => {
    const dbUpdate = {
      staff_name: entry.staffName,
      sales_amount: entry.salesAmount,
      timestamp: entry.timestamp,
      commission_rate: entry.commissionRate,
      service_type: entry.serviceType,
      user_id: session.user.id
    };
    const { error } = await supabase.from('entries').update(dbUpdate).eq('id', entry.id);
    if (!error) {
      setEntries(entries.map(e => e.id === entry.id ? {
        ...e,
        ...entry,
        staff_name: entry.staffName,
        sales_amount: entry.salesAmount,
        commission_rate: entry.commissionRate,
        service_type: entry.serviceType
      } : e));
    } else alert('Error: ' + error.message);
  };

  const deleteEntry = async (id) => {
    const { error } = await supabase.from('entries').delete().eq('id', id);
    if (!error) setEntries(entries.filter(e => e.id !== id));
  };

  const handleLogout = async () => await supabase.auth.signOut();

  // Normalize entries
  const uiEntries = entries.map(e => ({
    ...e,
    staffName: e.staff_name || e.staffName,
    salesAmount: e.sales_amount || e.salesAmount,
    commissionRate: e.commission_rate !== undefined ? e.commission_rate : e.commissionRate,
    serviceType: e.service_type || e.serviceType
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#EC5598',
          borderRadius: 8,
        },
      }}
    >
      {!session ? (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <Login />
        </main>
      ) : (
        <Layout
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleLogout={handleLogout}
          userEmail={session.user.email}
        >
          {activeTab === 'tracker' ? (
            <Dashboard
              staff={staff}
              entries={uiEntries}
              onAddEntry={addEntry}
              onEditEntry={editEntry}
              onDeleteEntry={deleteEntry}
            />
          ) : activeTab === 'calendar' ? (
            <CalendarTab entries={uiEntries} />
          ) : activeTab === 'notes' ? (
            <Notes />
          ) : (
            <StaffManager
              staff={staff}
              onAddStaff={addStaff}
              onRemoveStaff={removeStaff}
              onEditStaff={editStaff}
            />
          )}
        </Layout>
      )}
    </ConfigProvider>
  );
}

export default App;
