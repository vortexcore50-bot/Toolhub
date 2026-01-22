import React, { useState, useReducer, useEffect, createContext, useContext, useCallback, useMemo } from 'react';

const HealthcareContext = createContext();

const actionTypes = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  ADD_APPOINTMENT: 'ADD_APPOINTMENT',
  UPDATE_APPOINTMENT: 'UPDATE_APPOINTMENT',
  CANCEL_APPOINTMENT: 'CANCEL_APPOINTMENT',
  START_SESSION: 'START_SESSION',
  END_SESSION: 'END_SESSION',
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  CLEAR_CART: 'CLEAR_CART',
  PLACE_ORDER: 'PLACE_ORDER',
  UPDATE_ORDER: 'UPDATE_ORDER',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  READ_NOTIFICATION: 'READ_NOTIFICATION',
  ADD_PRODUCT: 'ADD_PRODUCT',
  UPDATE_PRODUCT: 'UPDATE_PRODUCT',
  ADD_DOCTOR: 'ADD_DOCTOR',
  UPDATE_DOCTOR: 'UPDATE_DOCTOR',
  ADD_REVIEW: 'ADD_REVIEW',
  UPDATE_STOCK: 'UPDATE_STOCK'
};

function healthcareReducer(state, action) {
  switch (action.type) {
    case actionTypes.LOGIN:
      return { ...state, user: action.payload.user, session: action.payload.session };
    case actionTypes.LOGOUT:
      return { ...state, user: null, session: null };
    case actionTypes.UPDATE_PROFILE:
      return { ...state, user: { ...state.user, ...action.payload } };
    case actionTypes.ADD_APPOINTMENT:
      return { ...state, appointments: [...state.appointments, action.payload] };
    case actionTypes.UPDATE_APPOINTMENT:
      return {
        ...state,
        appointments: state.appointments.map(apt =>
          apt.id === action.payload.id ? { ...apt, ...action.payload.updates } : apt
        )
      };
    case actionTypes.ADD_TO_CART:
      const existingQty = state.cart[action.payload.productId] || 0;
      return {
        ...state,
        cart: {
          ...state.cart,
          [action.payload.productId]: existingQty + action.payload.quantity
        }
      };
    case actionTypes.REMOVE_FROM_CART:
      const newCart = { ...state.cart };
      delete newCart[action.payload];
      return { ...state, cart: newCart };
    case actionTypes.CLEAR_CART:
      return { ...state, cart: {} };
    case actionTypes.PLACE_ORDER:
      return {
        ...state,
        orders: [action.payload, ...state.orders],
        cart: {}
      };
    case actionTypes.UPDATE_ORDER:
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.id ? { ...order, ...action.payload.updates } : order
        )
      };
    case actionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };
    case actionTypes.READ_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        )
      };
    case actionTypes.ADD_PRODUCT:
      return { ...state, products: [...state.products, action.payload] };
    case actionTypes.UPDATE_PRODUCT:
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        )
      };
    case actionTypes.ADD_DOCTOR:
      return { ...state, doctors: [...state.doctors, action.payload] };
    case actionTypes.UPDATE_DOCTOR:
      return {
        ...state,
        doctors: state.doctors.map(d =>
          d.id === action.payload.id ? { ...d, ...action.payload.updates } : d
        )
      };
    case actionTypes.ADD_REVIEW:
      return { ...state, reviews: [...state.reviews, action.payload] };
    case actionTypes.UPDATE_STOCK:
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.payload.id ? { ...p, stock: p.stock - action.payload.quantity } : p
        )
      };
    default:
      return state;
  }
}

const initialMockData = {
  products: [
    { id: 'prod_1', name: 'Blood Pressure Monitor', price: 2999, category: 'monitoring', stock: 42, image: '💓' },
    { id: 'prod_2', name: 'Diabetes Test Strips', price: 899, category: 'testing', stock: 150, image: '🧪' },
    { id: 'prod_3', name: 'Oxygen Concentrator', price: 45999, category: 'therapy', stock: 8, image: '🌬️' },
    { id: 'prod_4', name: 'Digital Thermometer', price: 499, category: 'monitoring', stock: 89, image: '🌡️' },
    { id: 'prod_5', name: 'Wheelchair Premium', price: 12999, category: 'mobility', stock: 15, image: '🦽' },
    { id: 'prod_6', name: 'Multivitamin Tablets', price: 699, category: 'medicine', stock: 200, image: '💊' },
    { id: 'prod_7', name: 'First Aid Kit', price: 1499, category: 'emergency', stock: 35, image: '🩹' },
    { id: 'prod_8', name: 'Pulse Oximeter', price: 1299, category: 'monitoring', stock: 67, image: '🩸' }
  ],
  doctors: [
    { id: 'doc_1', name: 'Dr. Sharma', specialty: 'Cardiology', fee: 800, rating: 4.8, available: true },
    { id: 'doc_2', name: 'Dr. Patel', specialty: 'Dermatology', fee: 600, rating: 4.6, available: true },
    { id: 'doc_3', name: 'Dr. Gupta', specialty: 'Pediatrics', fee: 500, rating: 4.9, available: true },
    { id: 'doc_4', name: 'Dr. Reddy', specialty: 'Orthopedics', fee: 700, rating: 4.7, available: false },
    { id: 'doc_5', name: 'Dr. Kumar', specialty: 'Neurology', fee: 900, rating: 4.8, available: true }
  ],
  timeSlots: ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']
};

const initialState = {
  user: null,
  session: null,
  appointments: [],
  activeSession: null,
  sessionHistory: [],
  products: initialMockData.products,
  cart: {},
  orders: [],
  doctors: initialMockData.doctors,
  notifications: [
    { id: 'notif_1', title: 'Welcome!', message: 'Your account is ready', time: '2024-01-20T10:00:00', read: false, type: 'system' },
    { id: 'notif_2', title: 'Appointment Reminder', message: 'Dr. Sharma tomorrow at 14:00', time: '2024-01-20T14:30:00', read: false, type: 'appointment' }
  ],
  reviews: [],
  adminStats: {
    totalRevenue: 0,
    totalAppointments: 0,
    totalOrders: 0,
    totalPatients: 0
  }
};

function simulateAPI(delay = 600) {
  return new Promise(resolve => setTimeout(resolve, delay));
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function App() {
  const [state, dispatch] = useReducer(healthcareReducer, initialState);
  const [activeView, setActiveView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '', name: '', mobile: '' });
  const [bookingData, setBookingData] = useState({ doctorId: '', date: '', timeSlot: '' });
  const [checkoutData, setCheckoutData] = useState({ address: '', city: '', pincode: '', paymentMethod: 'UPI' });
  const [adminForm, setAdminForm] = useState({ type: '', data: {} });
  const [callTimer, setCallTimer] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('healthcare_user');
    const savedCart = localStorage.getItem('healthcare_cart');
    
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      dispatch({ type: actionTypes.LOGIN, payload: { user: userData, session: { token: 'saved_token', expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() } } });
      setActiveView(userData.role === 'admin' ? 'admin-dashboard' : 'dashboard');
    }
    
    if (savedCart) {
      dispatch({ type: actionTypes.UPDATE_CART, payload: JSON.parse(savedCart) });
    }
    
    const stats = calculateStats();
    dispatch({ type: actionTypes.UPDATE_STATS, payload: stats });
  }, []);

  useEffect(() => {
    if (state.user) {
      localStorage.setItem('healthcare_user', JSON.stringify(state.user));
    }
    if (Object.keys(state.cart).length > 0) {
      localStorage.setItem('healthcare_cart', JSON.stringify(state.cart));
    } else {
      localStorage.removeItem('healthcare_cart');
    }
  }, [state.user, state.cart]);

  useEffect(() => {
    let interval;
    if (state.activeSession) {
      interval = setInterval(() => {
        setCallTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.activeSession]);

  const calculateStats = () => {
    const totalRevenue = state.orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalAppointments = state.appointments.length;
    const totalOrders = state.orders.length;
    const totalPatients = [...new Set(state.appointments.map(a => a.patientId))].length;
    
    return { totalRevenue, totalAppointments, totalOrders, totalPatients };
  };

  const handleLogin = async () => {
    setLoading(true);
    await simulateAPI(800);
    
    const isAdmin = loginData.email.includes('admin');
    const user = {
      id: `user_${Date.now()}`,
      email: loginData.email,
      name: isAdmin ? 'Admin User' : loginData.name || 'John Doe',
      role: isAdmin ? 'admin' : 'patient',
      mobile: loginData.mobile || '+919876543210',
      joined: new Date().toISOString()
    };
    
    const session = {
      token: 'mock_jwt_token_' + Date.now(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    dispatch({ type: actionTypes.LOGIN, payload: { user, session } });
    
    dispatch({
      type: actionTypes.ADD_NOTIFICATION,
      payload: {
        id: `notif_${Date.now()}`,
        title: 'Login Successful',
        message: `Welcome ${user.name}`,
        time: new Date().toISOString(),
        read: false,
        type: 'system'
      }
    });
    
    setLoading(false);
    setActiveView(user.role === 'admin' ? 'admin-dashboard' : 'dashboard');
    setLoginData({ email: '', password: '', name: '', mobile: '' });
  };

  const handleRegister = async () => {
    if (authMode === 'otp') {
      await handleLogin();
      return;
    }
    
    setLoading(true);
    await simulateAPI(1000);
    
    const generatedOTP = generateOTP();
    dispatch({
      type: actionTypes.ADD_NOTIFICATION,
      payload: {
        id: `notif_${Date.now()}`,
        title: 'OTP Sent',
        message: `Your OTP is ${generatedOTP}`,
        time: new Date().toISOString(),
        read: false,
        type: 'system'
      }
    });
    
    setAuthMode('otp');
    setLoading(false);
  };

  const handleLogout = () => {
    dispatch({ type: actionTypes.LOGOUT });
    localStorage.removeItem('healthcare_user');
    setActiveView('login');
    setSidebarOpen(false);
  };

  const bookAppointment = async () => {
    if (!bookingData.doctorId || !bookingData.date || !bookingData.timeSlot) {
      alert('Please select all fields');
      return;
    }
    
    setLoading(true);
    await simulateAPI(1200);
    
    const doctor = state.doctors.find(d => d.id === bookingData.doctorId);
    const appointment = {
      id: `apt_${Date.now()}`,
      doctorId: bookingData.doctorId,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      date: bookingData.date,
      timeSlot: bookingData.timeSlot,
      status: 'confirmed',
      fee: doctor.fee,
      createdAt: new Date().toISOString(),
      patientId: state.user.id,
      patientName: state.user.name
    };
    
    dispatch({ type: actionTypes.ADD_APPOINTMENT, payload: appointment });
    
    dispatch({
      type: actionTypes.ADD_NOTIFICATION,
      payload: {
        id: `notif_${Date.now()}`,
        title: 'Appointment Booked',
        message: `With ${doctor.name} at ${bookingData.timeSlot}`,
        time: new Date().toISOString(),
        read: false,
        type: 'appointment'
      }
    });
    
    setBookingData({ doctorId: '', date: '', timeSlot: '' });
    setLoading(false);
    setActiveView('appointments');
  };

  const cancelAppointment = async (appointmentId) => {
    setLoading(true);
    await simulateAPI(800);
    
    const appointment = state.appointments.find(a => a.id === appointmentId);
    
    dispatch({
      type: actionTypes.UPDATE_APPOINTMENT,
      payload: {
        id: appointmentId,
        updates: { 
          status: 'cancelled', 
          cancelledAt: new Date().toISOString(),
          cancellationReason: 'Patient requested'
        }
      }
    });
    
    dispatch({
      type: actionTypes.ADD_NOTIFICATION,
      payload: {
        id: `notif_${Date.now()}`,
        title: 'Appointment Cancelled',
        message: `Refund of ₹${appointment.fee} initiated`,
        time: new Date().toISOString(),
        read: false,
        type: 'appointment'
      }
    });
    
    setLoading(false);
  };

  const startTeleconsultation = async (appointmentId) => {
    const appointment = state.appointments.find(a => a.id === appointmentId);
    if (!appointment) return;
    
    setLoading(true);
    await simulateAPI(500);
    
    dispatch({
      type: actionTypes.UPDATE_APPOINTMENT,
      payload: {
        id: appointmentId,
        updates: { 
          status: 'in_session', 
          sessionStartedAt: new Date().toISOString() 
        }
      }
    });
    
    dispatch({
      type: actionTypes.START_SESSION,
      payload: {
        appointmentId,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
        startedAt: new Date().toISOString()
      }
    });
    
    setChatMessages([{
      id: 'msg_1',
      sender: 'system',
      text: 'Doctor has joined the consultation',
      time: new Date().toISOString()
    }]);
    
    setCallTimer(0);
    setLoading(false);
    setActiveView('teleconsultation');
  };

  const endTeleconsultation = () => {
    if (!state.activeSession) return;
    
    dispatch({
      type: actionTypes.UPDATE_APPOINTMENT,
      payload: {
        id: state.activeSession.appointmentId,
        updates: { 
          status: 'completed', 
          completedAt: new Date().toISOString(),
          duration: callTimer
        }
      }
    });
    
    dispatch({
      type: actionTypes.END_SESSION,
      payload: {
        endedAt: new Date().toISOString(),
        duration: callTimer
      }
    });
    
    setActiveView('appointments');
    setCallTimer(0);
    setChatMessages([]);
    setNewMessage('');
  };

  const sendChatMessage = () => {
    if (!newMessage.trim() || !state.activeSession) return;
    
    const message = {
      id: `msg_${Date.now()}`,
      sender: 'patient',
      text: newMessage,
      time: new Date().toISOString()
    };
    
    setChatMessages([...chatMessages, message]);
    setNewMessage('');
    
    setTimeout(() => {
      const doctorReply = {
        id: `msg_${Date.now() + 1}`,
        sender: 'doctor',
        text: 'Thank you for sharing that. Continue with your prescribed medication.',
        time: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, doctorReply]);
    }, 2000);
  };

  const addToCart = (productId, quantity = 1) => {
    const product = state.products.find(p => p.id === productId);
    if (!product || product.stock < quantity) {
      alert('Insufficient stock');
      return;
    }
    
    dispatch({
      type: actionTypes.ADD_TO_CART,
      payload: { productId, quantity }
    });
    
    dispatch({
      type: actionTypes.ADD_NOTIFICATION,
      payload: {
        id: `notif_${Date.now()}`,
        title: 'Added to Cart',
        message: `${product.name} x${quantity}`,
        time: new Date().toISOString(),
        read: false,
        type: 'cart'
      }
    });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: actionTypes.REMOVE_FROM_CART, payload: productId });
  };

  const checkout = async () => {
    if (Object.keys(state.cart).length === 0) {
      alert('Cart is empty');
      return;
    }
    
    setLoading(true);
    await simulateAPI(1500);
    
    const orderItems = Object.entries(state.cart).map(([productId, quantity]) => {
      const product = state.products.find(p => p.id === productId);
      return {
        productId,
        name: product.name,
        quantity,
        price: product.price,
        total: product.price * quantity
      };
    });
    
    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    const shipping = subtotal > 1000 ? 0 : 99;
    const totalAmount = subtotal + shipping;
    
    const order = {
      id: `order_${Date.now()}`,
      items: orderItems,
      subtotal,
      shipping,
      totalAmount,
      status: 'placed',
      address: `${checkoutData.address}, ${checkoutData.city} - ${checkoutData.pincode}`,
      paymentMethod: checkoutData.paymentMethod,
      paymentStatus: 'completed',
      trackingId: `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      patientId: state.user.id,
      patientName: state.user.name
    };
    
    orderItems.forEach(item => {
      dispatch({
        type: actionTypes.UPDATE_STOCK,
        payload: { id: item.productId, quantity: item.quantity }
      });
    });
    
    dispatch({ type: actionTypes.PLACE_ORDER, payload: order });
    dispatch({ type: actionTypes.CLEAR_CART });
    
    dispatch({
      type: actionTypes.ADD_NOTIFICATION,
      payload: {
        id: `notif_${Date.now()}`,
        title: 'Order Placed',
        message: `Order #${order.id.split('_')[1]} confirmed`,
        time: new Date().toISOString(),
        read: false,
        type: 'order'
      }
    });
    
    setCheckoutData({ address: '', city: '', pincode: '', paymentMethod: 'UPI' });
    setLoading(false);
    setActiveView('orders');
  };

  const updateOrderStatus = (orderId, status) => {
    dispatch({
      type: actionTypes.UPDATE_ORDER,
      payload: {
        id: orderId,
        updates: { 
          status,
          updatedAt: new Date().toISOString(),
          ...(status === 'shipped' && { shippedAt: new Date().toISOString() }),
          ...(status === 'delivered' && { deliveredAt: new Date().toISOString() })
        }
      }
    });
  };

  const addProduct = (productData) => {
    const product = {
      id: `prod_${Date.now()}`,
      ...productData,
      createdAt: new Date().toISOString()
    };
    
    dispatch({ type: actionTypes.ADD_PRODUCT, payload: product });
  };

  const addDoctor = (doctorData) => {
    const doctor = {
      id: `doc_${Date.now()}`,
      ...doctorData,
      available: true,
      joinedAt: new Date().toISOString()
    };
    
    dispatch({ type: actionTypes.ADD_DOCTOR, payload: doctor });
  };

  const markNotificationRead = (notificationId) => {
    dispatch({ type: actionTypes.READ_NOTIFICATION, payload: notificationId });
  };

  const unreadNotifications = state.notifications.filter(n => !n.read).length;

  const upcomingAppointments = state.appointments
    .filter(a => a.status === 'confirmed' || a.status === 'in_session')
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const cartTotal = Object.entries(state.cart).reduce((total, [productId, quantity]) => {
    const product = state.products.find(p => p.id === productId);
    return total + (product?.price || 0) * quantity;
  }, 0);

  const today = new Date().toISOString().split('T')[0];

  if (!state.user) {
    return (
      <div style={styles.authContainer}>
        <div style={styles.authCard}>
          <div style={styles.authHeader}>
            <h1 style={styles.logo}>HealthCare+</h1>
            <p style={styles.tagline}>Your Health, Our Priority</p>
          </div>
          
          <h2 style={styles.authTitle}>
            {authMode === 'login' ? 'Welcome Back' : 
             authMode === 'otp' ? 'Verify OTP' : 'Create Account'}
          </h2>
          
          {authMode !== 'otp' ? (
            <>
              {authMode === 'register' && (
                <input
                  type="text"
                  placeholder="Full Name"
                  value={loginData.name}
                  onChange={(e) => setLoginData({...loginData, name: e.target.value})}
                  style={styles.input}
                />
              )}
              
              <input
                type="email"
                placeholder="Email Address"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                style={styles.input}
              />
              
              <input
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                style={styles.input}
              />
              
              {authMode === 'register' && (
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  value={loginData.mobile}
                  onChange={(e) => setLoginData({...loginData, mobile: e.target.value})}
                  style={styles.input}
                />
              )}
              
              <button
                onClick={authMode === 'login' ? handleLogin : handleRegister}
                style={styles.authButton}
                disabled={loading}
              >
                {loading ? 'Processing...' : 
                 authMode === 'login' ? 'Login' : 'Continue'}
              </button>
              
              <div style={styles.authLinks}>
                {authMode === 'login' ? (
                  <>
                    <button 
                      style={styles.linkButton}
                      onClick={() => setAuthMode('register')}
                    >
                      New User? Register
                    </button>
                    <button 
                      style={styles.linkButton}
                      onClick={() => {
                        setLoginData({ email: 'admin@healthcare.com', password: 'admin123' });
                        handleLogin();
                      }}
                    >
                      Admin Login
                    </button>
                    <button 
                      style={styles.linkButton}
                      onClick={() => {
                        setLoginData({ email: 'patient@example.com', password: 'password' });
                        handleLogin();
                      }}
                    >
                      Demo Patient
                    </button>
                  </>
                ) : (
                  <button 
                    style={styles.linkButton}
                    onClick={() => setAuthMode('login')}
                  >
                    Already have an account? Login
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div style={styles.otpContainer}>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={styles.otpInput}
                  maxLength={6}
                />
                <small style={styles.otpNote}>OTP sent to your mobile</small>
              </div>
              
              <button
                onClick={handleRegister}
                style={styles.authButton}
                disabled={loading || otp.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              
              <button 
                style={styles.linkButton}
                onClick={() => setAuthMode('register')}
              >
                Resend OTP
              </button>
            </>
          )}
          
          <div style={styles.authFooter}>
            <p style={styles.footerText}>By continuing, you agree to our Terms & Privacy</p>
            <p style={styles.footerText}>HIPAA Compliant • SSL Secured</p>
          </div>
        </div>
      </div>
    );
  }

  if (state.user.role === 'admin') {
    return (
      <div style={styles.adminContainer}>
        <aside style={{
          ...styles.adminSidebar,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'
        }}>
          <div style={styles.sidebarHeader}>
            <h3 style={styles.sidebarTitle}>🏥 Admin Panel</h3>
            <button 
              onClick={() => setSidebarOpen(false)}
              style={styles.closeSidebar}
            >
              ×
            </button>
          </div>
          
          <div style={styles.adminProfile}>
            <div style={styles.adminAvatar}>A</div>
            <div>
              <strong>{state.user.name}</strong>
              <p>Administrator</p>
            </div>
          </div>
          
          <nav style={styles.sidebarNav}>
            {[
              { id: 'admin-dashboard', label: '📊 Dashboard', icon: '📊' },
              { id: 'admin-appointments', label: '📅 Appointments', icon: '📅' },
              { id: 'admin-doctors', label: '👨‍⚕️ Doctors', icon: '👨‍⚕️' },
              { id: 'admin-products', label: '💊 Products', icon: '💊' },
              { id: 'admin-orders', label: '📦 Orders', icon: '📦' },
              { id: 'admin-patients', label: '👥 Patients', icon: '👥' },
              { id: 'admin-analytics', label: '📈 Analytics', icon: '📈' },
              { id: 'admin-content', label: '📝 Content', icon: '📝' },
              { id: 'admin-reports', label: '📄 Reports', icon: '📄' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setSidebarOpen(false);
                }}
                style={{
                  ...styles.navButton,
                  ...(activeView === item.id ? styles.navButtonActive : {})
                }}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          
          <div style={styles.sidebarFooter}>
            <button onClick={handleLogout} style={styles.logoutButton}>
              🚪 Logout
            </button>
          </div>
        </aside>
        
        <div style={{
          ...styles.adminMain,
          marginLeft: sidebarOpen ? '250px' : '0',
          transition: 'margin-left 0.3s'
        }}>
          <header style={styles.adminHeader}>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={styles.menuButton}
            >
              {sidebarOpen ? '✕' : '☰'}
            </button>
            
            <div style={styles.headerTitle}>
              <h2>
                {activeView === 'admin-dashboard' && 'Dashboard'}
                {activeView === 'admin-appointments' && 'Appointment Management'}
                {activeView === 'admin-doctors' && 'Doctor Management'}
                {activeView === 'admin-products' && 'Product Management'}
                {activeView === 'admin-orders' && 'Order Management'}
                {activeView === 'admin-patients' && 'Patient Management'}
                {activeView === 'admin-analytics' && 'Analytics & Reports'}
                {activeView === 'admin-content' && 'Content Management'}
                {activeView === 'admin-reports' && 'Financial Reports'}
              </h2>
            </div>
            
            <div style={styles.headerActions}>
              <button 
                onClick={() => setActiveView('admin-notifications')}
                style={styles.notificationButton}
              >
                🔔 {unreadNotifications > 0 && (
                  <span style={styles.notificationBadge}>
                    {unreadNotifications}
                  </span>
                )}
              </button>
              <div style={styles.adminQuickActions}>
                <button 
                  onClick={() => {
                    setAdminForm({ type: 'add-doctor', data: {} });
                    setActiveView('admin-doctors');
                  }}
                  style={styles.primaryButtonSmall}
                >
                  + Add Doctor
                </button>
                <button 
                  onClick={() => {
                    setAdminForm({ type: 'add-product', data: {} });
                    setActiveView('admin-products');
                  }}
                  style={styles.primaryButtonSmall}
                >
                  + Add Product
                </button>
              </div>
            </div>
          </header>
          
          <main style={styles.adminContent}>
            {loading && (
              <div style={styles.loadingOverlay}>
                <div style={styles.spinner}></div>
              </div>
            )}
            
            {activeView === 'admin-dashboard' && (
              <div style={styles.dashboardGrid}>
                <div style={styles.statsCard}>
                  <h3>💰 Total Revenue</h3>
                  <p style={styles.statValue}>
                    ₹{(state.orders.reduce((sum, o) => sum + o.totalAmount, 0) / 1000).toFixed(1)}K
                  </p>
                  <p style={styles.statChange}>+12.5% this month</p>
                </div>
                
                <div style={styles.statsCard}>
                  <h3>📅 Appointments</h3>
                  <p style={styles.statValue}>{state.appointments.length}</p>
                  <p style={styles.statChange}>
                    {state.appointments.filter(a => a.status === 'confirmed').length} active
                  </p>
                </div>
                
                <div style={styles.statsCard}>
                  <h3>📦 Orders</h3>
                  <p style={styles.statValue}>{state.orders.length}</p>
                  <p style={styles.statChange}>
                    {state.orders.filter(o => o.status === 'delivered').length} delivered
                  </p>
                </div>
                
                <div style={styles.statsCard}>
                  <h3>👥 Patients</h3>
                  <p style={styles.statValue}>
                    {[...new Set(state.appointments.map(a => a.patientId))].length}
                  </p>
                  <p style={styles.statChange}>+5 new this week</p>
                </div>
                
                <div style={{ ...styles.dashboardCard, gridColumn: 'span 2' }}>
                  <h3>📊 Revenue Trend</h3>
                  <div style={styles.chartPlaceholder}>
                    Revenue visualization chart
                  </div>
                </div>
                
                <div style={styles.dashboardCard}>
                  <h3>👨‍⚕️ Doctor Availability</h3>
                  {state.doctors.slice(0, 4).map(doctor => (
                    <div key={doctor.id} style={styles.doctorStatus}>
                      <span>{doctor.name}</span>
                      <span style={{
                        ...styles.statusDot,
                        backgroundColor: doctor.available ? '#10b981' : '#dc2626'
                      }}></span>
                    </div>
                  ))}
                </div>
                
                <div style={{ ...styles.dashboardCard, gridColumn: 'span 2' }}>
                  <h3>🚨 Recent Alerts</h3>
                  {state.products.filter(p => p.stock < 10).map(product => (
                    <div key={product.id} style={styles.alertItem}>
                      <span>⚠️ Low stock: {product.name}</span>
                      <span>Only {product.stock} left</span>
                    </div>
                  ))}
                  {state.appointments.filter(a => a.status === 'in_session').map(apt => (
                    <div key={apt.id} style={styles.alertItem}>
                      <span>🎥 Live consultation: {apt.doctorName}</span>
                      <span>with {apt.patientName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeView === 'admin-appointments' && (
              <div>
                <div style={styles.sectionHeader}>
                  <h2>Appointment Management</h2>
                  <button style={styles.primaryButton}>
                    + Schedule Appointment
                  </button>
                </div>
                
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Date & Time</th>
                        <th>Status</th>
                        <th>Fee</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.appointments.map(apt => (
                        <tr key={apt.id}>
                          <td>{apt.id.split('_')[1]}</td>
                          <td>{apt.patientName}</td>
                          <td>{apt.doctorName}</td>
                          <td>{apt.date} {apt.timeSlot}</td>
                          <td>
                            <span style={{
                              ...styles.statusBadge,
                              ...(apt.status === 'confirmed' ? styles.statusSuccess :
                                   apt.status === 'cancelled' ? styles.statusError :
                                   apt.status === 'completed' ? styles.statusCompleted :
                                   apt.status === 'in_session' ? styles.statusWarning : {})
                            }}>
                              {apt.status}
                            </span>
                          </td>
                          <td>₹{apt.fee}</td>
                          <td>
                            <div style={styles.actionButtons}>
                              {apt.status === 'confirmed' && (
                                <button style={styles.smallButton}>Start</button>
                              )}
                              {apt.status === 'in_session' && (
                                <button style={styles.smallButtonWarning}>Join</button>
                              )}
                              <button style={styles.smallButton}>Details</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeView === 'admin-doctors' && (
              <div>
                <div style={styles.sectionHeader}>
                  <h2>Doctor Management</h2>
                  <button 
                    onClick={() => setAdminForm({ type: 'add-doctor', data: {} })}
                    style={styles.primaryButton}
                  >
                    + Add New Doctor
                  </button>
                </div>
                
                {adminForm.type === 'add-doctor' && (
                  <div style={styles.formCard}>
                    <h3>Add New Doctor</h3>
                    <div style={styles.formGrid}>
                      <input type="text" placeholder="Full Name" style={styles.input} />
                      <input type="text" placeholder="Specialty" style={styles.input} />
                      <input type="number" placeholder="Consultation Fee" style={styles.input} />
                      <input type="text" placeholder="Qualifications" style={styles.input} />
                      <input type="text" placeholder="Experience (years)" style={styles.input} />
                    </div>
                    <div style={styles.formActions}>
                      <button style={styles.primaryButton}>Save Doctor</button>
                      <button 
                        onClick={() => setAdminForm({ type: '', data: {} })}
                        style={styles.secondaryButton}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                
                <div style={styles.doctorsGrid}>
                  {state.doctors.map(doctor => (
                    <div key={doctor.id} style={styles.doctorCard}>
                      <div style={styles.doctorHeader}>
                        <div style={styles.doctorAvatar}>
                          {doctor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3>{doctor.name}</h3>
                          <p>{doctor.specialty}</p>
                        </div>
                      </div>
                      <div style={styles.doctorDetails}>
                        <p>Fee: ₹{doctor.fee}</p>
                        <p>Rating: {doctor.rating} ★</p>
                        <p>Status: 
                          <span style={{
                            color: doctor.available ? '#10b981' : '#dc2626',
                            fontWeight: 'bold',
                            marginLeft: '5px'
                          }}>
                            {doctor.available ? 'Available' : 'Unavailable'}
                          </span>
                        </p>
                      </div>
                      <div style={styles.cardActions}>
                        <button style={styles.smallButton}>Edit</button>
                        <button style={styles.smallButton}>Schedule</button>
                        <button style={styles.smallButton}>Availability</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeView === 'admin-products' && (
              <div>
                <div style={styles.sectionHeader}>
                  <h2>Product Inventory</h2>
                  <button 
                    onClick={() => setAdminForm({ type: 'add-product', data: {} })}
                    style={styles.primaryButton}
                  >
                    + Add Product
                  </button>
                </div>
                
                {adminForm.type === 'add-product' && (
                  <div style={styles.formCard}>
                    <h3>Add New Product</h3>
                    <div style={styles.formGrid}>
                      <input type="text" placeholder="Product Name" style={styles.input} />
                      <select style={styles.input}>
                        <option>Category</option>
                        <option>medicine</option>
                        <option>monitoring</option>
                        <option>therapy</option>
                        <option>mobility</option>
                      </select>
                      <input type="number" placeholder="Price" style={styles.input} />
                      <input type="number" placeholder="Stock Quantity" style={styles.input} />
                      <input type="text" placeholder="Manufacturer" style={styles.input} />
                    </div>
                    <div style={styles.formActions}>
                      <button style={styles.primaryButton}>Add Product</button>
                      <button 
                        onClick={() => setAdminForm({ type: '', data: {} })}
                        style={styles.secondaryButton}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.products.map(product => (
                        <tr key={product.id}>
                          <td>
                            <div style={styles.productRow}>
                              <span style={styles.productIcon}>{product.image}</span>
                              {product.name}
                            </div>
                          </td>
                          <td>{product.category}</td>
                          <td>₹{product.price}</td>
                          <td>
                            <span style={{
                              color: product.stock < 10 ? '#dc2626' : 
                                     product.stock < 20 ? '#f59e0b' : '#10b981'
                            }}>
                              {product.stock}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              ...styles.statusBadge,
                              backgroundColor: product.stock === 0 ? '#dc2626' :
                                            product.stock < 10 ? '#f59e0b' : '#10b981'
                            }}>
                              {product.stock === 0 ? 'Out of Stock' :
                               product.stock < 10 ? 'Low Stock' : 'In Stock'}
                            </span>
                          </td>
                          <td>
                            <div style={styles.actionButtons}>
                              <button style={styles.smallButton}>Edit</button>
                              <button style={styles.smallButton}>Update Stock</button>
                              <button style={styles.smallButton}>View</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeView === 'admin-orders' && (
              <div>
                <div style={styles.sectionHeader}>
                  <h2>Order Management</h2>
                  <select style={styles.selectInput}>
                    <option>All Status</option>
                    <option>Placed</option>
                    <option>Confirmed</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </select>
                </div>
                
                <div style={styles.ordersGrid}>
                  {state.orders.map(order => (
                    <div key={order.id} style={styles.orderCardAdmin}>
                      <div style={styles.orderHeader}>
                        <div>
                          <strong>Order #{order.id.split('_')[1]}</strong>
                          <p>{order.patientName}</p>
                        </div>
                        <span style={styles.trackingId}>{order.trackingId}</span>
                      </div>
                      
                      <div style={styles.orderItems}>
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} style={styles.orderItemRow}>
                            <span>{item.name} × {item.quantity}</span>
                            <span>₹{item.total}</span>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div style={styles.moreItems}>+{order.items.length - 2} more items</div>
                        )}
                      </div>
                      
                      <div style={styles.orderFooter}>
                        <div>
                          <strong>Total: ₹{order.totalAmount}</strong>
                          <p>Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        
                        <div style={styles.orderActions}>
                          <select 
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            style={styles.statusSelect}
                          >
                            <option value="placed">Placed</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="packed">Packed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button style={styles.smallButton}>Details</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeView === 'admin-notifications' && (
              <div style={styles.notificationsPanel}>
                <h2>Notifications</h2>
                <div style={styles.notificationsList}>
                  {state.notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      style={{
                        ...styles.notificationItem,
                        ...(!notif.read ? styles.notificationUnread : {})
                      }}
                      onClick={() => markNotificationRead(notif.id)}
                    >
                      <div style={styles.notificationIcon}>
                        {notif.type === 'appointment' && '📅'}
                        {notif.type === 'order' && '📦'}
                        {notif.type === 'cart' && '🛒'}
                        {notif.type === 'system' && 'ℹ️'}
                        {notif.type === 'alert' && '⚠️'}
                      </div>
                      <div style={styles.notificationContent}>
                        <h4>{notif.title}</h4>
                        <p>{notif.message}</p>
                        <small>{new Date(notif.time).toLocaleString()}</small>
                      </div>
                      {!notif.read && <div style={styles.unreadDot}></div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={styles.menuButton}
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
        
        <div style={styles.logo} onClick={() => setActiveView('dashboard')}>
          🏥 HealthCare+
        </div>
        
        <nav style={{
          ...styles.nav,
          display: sidebarOpen ? 'flex' : 'none'
        }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
            { id: 'appointments', label: 'Appointments', icon: '📅' },
            { id: 'teleconsultation', label: 'Teleconsult', icon: '🎥' },
            { id: 'pharmacy', label: 'Pharmacy', icon: '💊' },
            { id: 'orders', label: 'Orders', icon: '📦' },
            { id: 'profile', label: 'Profile', icon: '👤' },
            { id: 'notifications', label: 'Notifications', icon: '🔔' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                setSidebarOpen(false);
              }}
              style={{
                ...styles.navItem,
                ...(activeView === item.id ? styles.navItemActive : {})
              }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        
        <div style={styles.headerActions}>
          <button 
            onClick={() => setActiveView('notifications')}
            style={styles.notificationButton}
          >
            🔔 {unreadNotifications > 0 && (
              <span style={styles.notificationBadge}>
                {unreadNotifications}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveView('cart')}
            style={styles.cartButton}
          >
            🛒 {Object.keys(state.cart).length > 0 && (
              <span style={styles.cartBadge}>
                {Object.values(state.cart).reduce((a, b) => a + b, 0)}
              </span>
            )}
          </button>
          <button 
            onClick={handleLogout}
            style={styles.logoutButton}
          >
            Logout
          </button>
        </div>
      </header>
      
      <main style={styles.main}>
        {loading && (
          <div style={styles.loadingOverlay}>
            <div style={styles.spinner}></div>
          </div>
        )}
        
        {activeView === 'dashboard' && (
          <div style={styles.dashboard}>
            <div style={styles.welcomeSection}>
              <h1>Welcome, {state.user.name}! 👋</h1>
              <p style={styles.welcomeText}>Your health dashboard • Last login: Today</p>
            </div>
            
            <div style={styles.quickActions}>
              <button 
                onClick={() => setActiveView('appointments')}
                style={styles.quickActionButton}
              >
                📅 Book Appointment
              </button>
              <button 
                onClick={() => setActiveView('pharmacy')}
                style={styles.quickActionButton}
              >
                💊 Order Medicine
              </button>
              <button 
                onClick={() => upcomingAppointments[0] && startTeleconsultation(upcomingAppointments[0].id)}
                style={styles.quickActionButton}
                disabled={upcomingAppointments.length === 0}
              >
                🎥 Start Consultation
              </button>
              <button 
                onClick={() => setActiveView('profile')}
                style={styles.quickActionButton}
              >
                👤 View Profile
              </button>
            </div>
            
            <div style={styles.dashboardGrid}>
              <div style={styles.dashboardCard}>
                <h3>📅 Upcoming Appointments</h3>
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.slice(0, 3).map(apt => (
                    <div key={apt.id} style={styles.appointmentCard}>
                      <div>
                        <strong>{apt.doctorName}</strong>
                        <div style={styles.specialty}>{apt.specialty}</div>
                        <small>{apt.date} at {apt.timeSlot}</small>
                      </div>
                      <div style={styles.appointmentActions}>
                        <button 
                          onClick={() => startTeleconsultation(apt.id)}
                          style={styles.smallButton}
                          disabled={apt.status === 'in_session'}
                        >
                          {apt.status === 'in_session' ? 'Live' : 'Join'}
                        </button>
                        <button 
                          onClick={() => cancelAppointment(apt.id)}
                          style={styles.smallButtonDanger}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={styles.emptyState}>No upcoming appointments</p>
                )}
                <button 
                  onClick={() => setActiveView('appointments')}
                  style={styles.viewAllButton}
                >
                  View All Appointments →
                </button>
              </div>
              
              <div style={styles.dashboardCard}>
                <h3>📦 Recent Orders</h3>
                {state.orders.slice(0, 3).map(order => (
                  <div key={order.id} style={styles.orderCard}>
                    <div>
                      <strong>Order #{order.id.split('_')[1]}</strong>
                      <div>₹{order.totalAmount} • {order.status}</div>
                      <small>{order.trackingId}</small>
                    </div>
                    <button 
                      onClick={() => setActiveView('orders')}
                      style={styles.smallButton}
                    >
                      Track
                    </button>
                  </div>
                ))}
                {state.orders.length === 0 && (
                  <p style={styles.emptyState}>No orders yet</p>
                )}
                <button 
                  onClick={() => setActiveView('orders')}
                  style={styles.viewAllButton}
                >
                  View Order History →
                </button>
              </div>
              
              <div style={styles.dashboardCard}>
                <h3>💊 Recommended Products</h3>
                {state.products.slice(0, 4).map(product => (
                  <div key={product.id} style={styles.productItem}>
                    <div>
                      <span style={styles.productIconSmall}>{product.image}</span>
                      <span>{product.name}</span>
                    </div>
                    <div style={styles.productActions}>
                      <span>₹{product.price}</span>
                      <button 
                        onClick={() => addToCart(product.id)}
                        style={styles.addButton}
                        disabled={product.stock === 0}
                      >
                        {product.stock === 0 ? 'Out' : 'Add'}
                      </button>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => setActiveView('pharmacy')}
                  style={styles.viewAllButton}
                >
                  Browse All Products →
                </button>
              </div>
              
              <div style={styles.dashboardCard}>
                <h3>👨‍⚕️ Available Doctors</h3>
                {state.doctors.filter(d => d.available).slice(0, 3).map(doctor => (
                  <div key={doctor.id} style={styles.doctorItem}>
                    <div>
                      <strong>{doctor.name}</strong>
                      <div>{doctor.specialty}</div>
                      <small>₹{doctor.fee} per consultation</small>
                    </div>
                    <button 
                      onClick={() => {
                        setBookingData({...bookingData, doctorId: doctor.id});
                        setActiveView('appointments');
                      }}
                      style={styles.smallButton}
                    >
                      Book
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeView === 'appointments' && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2>Book Appointment</h2>
              <div style={styles.appointmentStats}>
                <span>Total: {state.appointments.length}</span>
                <span>Upcoming: {upcomingAppointments.length}</span>
              </div>
            </div>
            
            <div style={styles.bookingForm}>
              <select
                value={bookingData.doctorId}
                onChange={(e) => setBookingData({...bookingData, doctorId: e.target.value})}
                style={styles.selectInput}
              >
                <option value="">Select Doctor</option>
                {state.doctors.filter(d => d.available).map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialty} (₹{doctor.fee})
                  </option>
                ))}
              </select>
              
              <input
                type="date"
                value={bookingData.date}
                onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                style={styles.input}
                min={today}
              />
              
              <select
                value={bookingData.timeSlot}
                onChange={(e) => setBookingData({...bookingData, timeSlot: e.target.value})}
                style={styles.selectInput}
              >
                <option value="">Select Time Slot</option>
                {initialMockData.timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
              
              <button
                onClick={bookAppointment}
                style={styles.primaryButton}
                disabled={loading || !bookingData.doctorId || !bookingData.date || !bookingData.timeSlot}
              >
                {loading ? 'Booking...' : 'Book Appointment'}
              </button>
            </div>
            
            <div style={styles.appointmentsList}>
              <h3>Your Appointments</h3>
              {state.appointments.length === 0 ? (
                <p style={styles.emptyState}>No appointments booked yet</p>
              ) : (
                state.appointments.map(apt => (
                  <div key={apt.id} style={styles.appointmentItem}>
                    <div style={styles.appointmentInfo}>
                      <div style={styles.appointmentHeader}>
                        <strong>{apt.doctorName}</strong>
                        <span style={styles.appointmentFee}>₹{apt.fee}</span>
                      </div>
                      <div style={styles.appointmentDetails}>
                        <span>{apt.specialty}</span>
                        <span>•</span>
                        <span>{apt.date}</span>
                        <span>•</span>
                        <span>{apt.timeSlot}</span>
                      </div>
                      <small>Booked on {new Date(apt.createdAt).toLocaleDateString()}</small>
                    </div>
                    <div style={styles.appointmentStatus}>
                      <span style={{
                        ...styles.statusBadge,
                        ...(apt.status === 'confirmed' ? styles.statusSuccess :
                             apt.status === 'cancelled' ? styles.statusError :
                             apt.status === 'completed' ? styles.statusCompleted :
                             apt.status === 'in_session' ? styles.statusWarning : {})
                      }}>
                        {apt.status}
                      </span>
                      <div style={styles.appointmentActions}>
                        {apt.status === 'confirmed' && (
                          <button 
                            onClick={() => startTeleconsultation(apt.id)}
                            style={styles.smallButton}
                          >
                            Join
                          </button>
                        )}
                        {apt.status === 'confirmed' && (
                          <button 
                            onClick={() => cancelAppointment(apt.id)}
                            style={styles.smallButtonDanger}
                          >
                            Cancel
                          </button>
                        )}
                        {apt.status === 'completed' && (
                          <button style={styles.smallButton}>
                            View Notes
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        {activeView === 'teleconsultation' && (
          <div style={styles.teleconsultation}>
            {state.activeSession ? (
              <>
                <div style={styles.callHeader}>
                  <div>
                    <h2>Live Consultation</h2>
                    <p>Duration: {Math.floor(callTimer / 60)}:{(callTimer % 60).toString().padStart(2, '0')}</p>
                  </div>
                  <button 
                    onClick={endTeleconsultation}
                    style={styles.endCallButton}
                  >
                    End Call
                  </button>
                </div>
                
                <div style={styles.callInterface}>
                  <div style={styles.videoGrid}>
                    <div style={styles.videoContainer}>
                      <div style={styles.videoPlaceholder}>
                        <div style={styles.videoLabel}>Doctor's Camera</div>
                      </div>
                      <div style={styles.videoInfo}>
                        <strong>Dr. {state.doctors.find(d => d.id === state.activeSession?.doctorId)?.name}</strong>
                        <span>Cardiologist</span>
                      </div>
                    </div>
                    
                    <div style={styles.videoContainer}>
                      <div style={styles.videoPlaceholder}>
                        <div style={styles.videoLabel}>Your Camera</div>
                      </div>
                      <div style={styles.videoInfo}>
                        <strong>You</strong>
                        <span>Patient</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={styles.callControls}>
                    <button style={styles.controlButton}>🎤 Mute</button>
                    <button style={styles.controlButton}>📹 Video Off</button>
                    <button style={styles.controlButton}>🖥️ Share Screen</button>
                    <button style={styles.controlButton}>📸 Snapshot</button>
                    <button style={styles.controlButton}>💬 Chat</button>
                  </div>
                  
                  <div style={styles.chatPanel}>
                    <h4>Chat Messages</h4>
                    <div style={styles.chatMessages}>
                      {chatMessages.map(msg => (
                        <div 
                          key={msg.id} 
                          style={{
                            ...styles.chatMessage,
                            alignSelf: msg.sender === 'patient' ? 'flex-end' : 'flex-start',
                            backgroundColor: msg.sender === 'patient' ? '#dbeafe' : '#f3f4f6'
                          }}
                        >
                          <div style={styles.chatMessageHeader}>
                            <strong>{msg.sender === 'patient' ? 'You' : 'Doctor'}</strong>
                            <small>{new Date(msg.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                          </div>
                          <p>{msg.text}</p>
                        </div>
                      ))}
                    </div>
                    <div style={styles.chatInput}>
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        style={styles.chatInputField}
                        onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      />
                      <button onClick={sendChatMessage} style={styles.sendButton}>
                        Send
                      </button>
                    </div>
                  </div>
                </div>
                
                <div style={styles.medicalNotes}>
                  <h4>Medical Notes</h4>
                  <textarea 
                    style={styles.textarea}
                    placeholder="Doctor's notes will appear here..."
                    rows="6"
                    readOnly
                    value="Patient presents with mild headache. Blood pressure: 120/80. Recommended: Rest and hydration. Follow up in 1 week."
                  ></textarea>
                  <div style={styles.notesActions}>
                    <button style={styles.primaryButton}>Download Prescription</button>
                    <button style={styles.secondaryButton}>Save Notes</button>
                  </div>
                </div>
              </>
            ) : (
              <div style={styles.noSession}>
                <h2>No Active Consultation</h2>
                <p>You don't have any active consultation session.</p>
                <button 
                  onClick={() => setActiveView('appointments')}
                  style={styles.primaryButton}
                >
                  Book an Appointment
                </button>
              </div>
            )}
          </div>
        )}
        
        {activeView === 'pharmacy' && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2>Pharmacy Store</h2>
              <div style={styles.searchBar}>
                <input type="text" placeholder="Search medicines..." style={styles.searchInput} />
                <select style={styles.selectInputSmall}>
                  <option>All Categories</option>
                  <option>medicine</option>
                  <option>monitoring</option>
                  <option>therapy</option>
                  <option>mobility</option>
                </select>
              </div>
            </div>
            
            <div style={styles.productsGrid}>
              {state.products.map(product => (
                <div key={product.id} style={styles.productCard}>
                  <div style={styles.productImage}>
                    <span style={styles.productIconLarge}>{product.image}</span>
                  </div>
                  <div style={styles.productInfo}>
                    <h3>{product.name}</h3>
                    <p style={styles.productCategory}>{product.category}</p>
                    <p style={styles.productPrice}>₹{product.price}</p>
                    <p style={{
                      color: product.stock === 0 ? '#dc2626' : 
                             product.stock < 10 ? '#f59e0b' : '#10b981',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {product.stock === 0 ? 'Out of Stock' : 
                       product.stock < 10 ? `Only ${product.stock} left` : 'In Stock'}
                    </p>
                  </div>
                  <div style={styles.productActions}>
                    <button 
                      onClick={() => addToCart(product.id)}
                      style={styles.addToCartButton}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button style={styles.secondaryButtonSmall}>
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeView === 'cart' && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2>Shopping Cart</h2>
              {Object.keys(state.cart).length > 0 && (
                <button 
                  onClick={() => dispatch({ type: actionTypes.CLEAR_CART })}
                  style={styles.clearCartButton}
                >
                  Clear Cart
                </button>
              )}
            </div>
            
            {Object.keys(state.cart).length === 0 ? (
              <div style={styles.emptyCart}>
                <div style={styles.emptyCartIcon}>🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add some healthcare products to get started</p>
                <button 
                  onClick={() => setActiveView('pharmacy')}
                  style={styles.primaryButton}
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div style={styles.cartLayout}>
                <div style={styles.cartItems}>
                  {Object.entries(state.cart).map(([productId, quantity]) => {
                    const product = state.products.find(p => p.id === productId);
                    if (!product) return null;
                    
                    return (
                      <div key={productId} style={styles.cartItem}>
                        <div style={styles.cartItemImage}>
                          <span style={styles.cartItemIcon}>{product.image}</span>
                        </div>
                        <div style={styles.cartItemDetails}>
                          <h4>{product.name}</h4>
                          <p style={styles.cartItemCategory}>{product.category}</p>
                          <div style={styles.cartItemPrice}>
                            <span>₹{product.price} × {quantity} = ₹{product.price * quantity}</span>
                            <span style={styles.stockInfo}>
                              {product.stock < 10 && `Only ${product.stock} left`}
                            </span>
                          </div>
                        </div>
                        <div style={styles.cartItemActions}>
                          <div style={styles.quantityControl}>
                            <button 
                              onClick={() => {
                                if (quantity === 1) {
                                  removeFromCart(productId);
                                } else {
                                  dispatch({
                                    type: actionTypes.ADD_TO_CART,
                                    payload: { productId, quantity: -1 }
                                  });
                                }
                              }}
                              style={styles.quantityButton}
                            >
                              -
                            </button>
                            <span style={styles.quantityDisplay}>{quantity}</span>
                            <button 
                              onClick={() => addToCart(productId, 1)}
                              style={styles.quantityButton}
                              disabled={quantity >= product.stock}
                            >
                              +
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(productId)}
                            style={styles.removeButton}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div style={styles.cartSummary}>
                  <h3>Order Summary</h3>
                  <div style={styles.summaryItem}>
                    <span>Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span>Shipping</span>
                    <span>{cartTotal > 1000 ? 'FREE' : '₹99'}</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span>Tax (18%)</span>
                    <span>₹{(cartTotal * 0.18).toFixed(2)}</span>
                  </div>
                  <div style={styles.summaryTotal}>
                    <strong>Total</strong>
                    <strong>₹{(cartTotal + (cartTotal > 1000 ? 0 : 99) + (cartTotal * 0.18)).toFixed(2)}</strong>
                  </div>
                  
                  <div style={styles.checkoutForm}>
                    <h4>Delivery Details</h4>
                    <input
                      type="text"
                      placeholder="Address"
                      value={checkoutData.address}
                      onChange={(e) => setCheckoutData({...checkoutData, address: e.target.value})}
                      style={styles.input}
                    />
                    <div style={styles.addressGrid}>
                      <input
                        type="text"
                        placeholder="City"
                        value={checkoutData.city}
                        onChange={(e) => setCheckoutData({...checkoutData, city: e.target.value})}
                        style={styles.input}
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={checkoutData.pincode}
                        onChange={(e) => setCheckoutData({...checkoutData, pincode: e.target.value})}
                        style={styles.input}
                      />
                    </div>
                    
                    <h4>Payment Method</h4>
                    <div style={styles.paymentMethods}>
                      {['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash on Delivery'].map(method => (
                        <label key={method} style={styles.paymentMethod}>
                          <input
                            type="radio"
                            name="payment"
                            value={method}
                            checked={checkoutData.paymentMethod === method}
                            onChange={(e) => setCheckoutData({...checkoutData, paymentMethod: e.target.value})}
                          />
                          {method}
                        </label>
                      ))}
                    </div>
                    
                    <button 
                      onClick={checkout}
                      style={styles.checkoutButton}
                      disabled={loading || !checkoutData.address || !checkoutData.city || !checkoutData.pincode}
                    >
                      {loading ? 'Processing...' : 'Proceed to Checkout'}
                    </button>
                    
                    <p style={styles.securityNote}>
                      🔒 Secure Payment • SSL Encrypted • HIPAA Compliant
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeView === 'orders' && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2>Your Orders</h2>
              <div style={styles.orderStats}>
                <span>Total: {state.orders.length}</span>
                <span>Delivered: {state.orders.filter(o => o.status === 'delivered').length}</span>
                <span>Pending: {state.orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length}</span>
              </div>
            </div>
            
            {state.orders.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>📦</div>
                <h3>No Orders Yet</h3>
                <p>Your order history will appear here</p>
                <button 
                  onClick={() => setActiveView('pharmacy')}
                  style={styles.primaryButton}
                >
                  Shop Now
                </button>
              </div>
            ) : (
              <div style={styles.ordersList}>
                {state.orders.map(order => (
                  <div key={order.id} style={styles.orderItemCard}>
                    <div style={styles.orderHeader}>
                      <div>
                        <strong>Order #{order.id.split('_')[1]}</strong>
                        <p>Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div style={styles.orderTracking}>
                        <span style={styles.trackingId}>Tracking: {order.trackingId}</span>
                        <span style={{
                          ...styles.statusBadge,
                          ...(order.status === 'delivered' ? styles.statusSuccess :
                               order.status === 'shipped' ? styles.statusInfo :
                               order.status === 'cancelled' ? styles.statusError : {})
                        }}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    
                    <div style={styles.orderDetails}>
                      <div style={styles.orderItemsPreview}>
                        <strong>Items:</strong>
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} style={styles.orderItemRow}>
                            <span>{item.name} × {item.quantity}</span>
                            <span>₹{item.total}</span>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div style={styles.moreItems}>+{order.items.length - 2} more items</div>
                        )}
                      </div>
                      
                      <div style={styles.orderProgress}>
                        <div style={styles.progressBar}>
                          {['placed', 'confirmed', 'packed', 'shipped', 'delivered'].map((stage, idx) => (
                            <div key={stage} style={styles.progressStep}>
                              <div style={{
                                ...styles.progressDot,
                                ...(idx <= ['placed', 'confirmed', 'packed', 'shipped', 'delivered'].indexOf(order.status) 
                                  ? styles.progressDotActive : {})
                              }}></div>
                              <div style={styles.progressLabel}>{stage}</div>
                            </div>
                          ))}
                        </div>
                        
                        <div style={styles.orderMeta}>
                          <div>
                            <strong>Total Amount:</strong>
                            <p>₹{order.totalAmount}</p>
                          </div>
                          <div>
                            <strong>Payment:</strong>
                            <p>{order.paymentMethod} • {order.paymentStatus}</p>
                          </div>
                          <div>
                            <strong>Delivery:</strong>
                            <p>{order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'Calculating...'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div style={styles.orderActions}>
                      <button style={styles.smallButton}>View Details</button>
                      <button style={styles.smallButton}>Track Order</button>
                      {order.status === 'delivered' && (
                        <button style={styles.smallButton}>Download Invoice</button>
                      )}
                      {order.status === 'delivered' && (
                        <button style={styles.smallButton}>Rate Products</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeView === 'notifications' && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2>Notifications</h2>
              {unreadNotifications > 0 && (
                <button 
                  onClick={() => state.notifications.forEach(n => markNotificationRead(n.id))}
                  style={styles.markAllReadButton}
                >
                  Mark All Read
                </button>
              )}
            </div>
            
            <div style={styles.notificationsList}>
              {state.notifications.length === 0 ? (
                <p style={styles.emptyState}>No notifications</p>
              ) : (
                state.notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    style={{
                      ...styles.notificationItem,
                      ...(!notif.read ? styles.notificationUnread : {})
                    }}
                    onClick={() => markNotificationRead(notif.id)}
                  >
                    <div style={styles.notificationIcon}>
                      {notif.type === 'appointment' && '📅'}
                      {notif.type === 'order' && '📦'}
                      {notif.type === 'cart' && '🛒'}
                      {notif.type === 'system' && 'ℹ️'}
                      {notif.type === 'alert' && '⚠️'}
                    </div>
                    <div style={styles.notificationContent}>
                      <div style={styles.notificationHeader}>
                        <h4>{notif.title}</h4>
                        <small>{new Date(notif.time).toLocaleString()}</small>
                      </div>
                      <p>{notif.message}</p>
                      {notif.type === 'appointment' && (
                        <button style={styles.smallButtonInline}>
                          View Appointment
                        </button>
                      )}
                      {notif.type === 'order' && (
                        <button style={styles.smallButtonInline}>
                          Track Order
                        </button>
                      )}
                    </div>
                    {!notif.read && <div style={styles.unreadDot}></div>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        {activeView === 'profile' && (
          <div style={styles.section}>
            <div style={styles.profileHeader}>
              <div style={styles.avatarLarge}>
                {state.user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h2>{state.user.name}</h2>
                <p style={styles.userEmail}>{state.user.email}</p>
                <p style={styles.userRole}>{state.user.role === 'patient' ? 'Patient Account' : 'Administrator'}</p>
              </div>
            </div>
            
            <div style={styles.profileGrid}>
              <div style={styles.profileCard}>
                <h3>📊 Account Overview</h3>
                <div style={styles.statsGrid}>
                  <div style={styles.statItem}>
                    <strong>Appointments</strong>
                    <p>{state.appointments.length}</p>
                  </div>
                  <div style={styles.statItem}>
                    <strong>Orders</strong>
                    <p>{state.orders.length}</p>
                  </div>
                  <div style={styles.statItem}>
                    <strong>Consultations</strong>
                    <p>{state.appointments.filter(a => a.status === 'completed').length}</p>
                  </div>
                  <div style={styles.statItem}>
                    <strong>Member Since</strong>
                    <p>{new Date(state.user.joined).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div style={styles.profileActions}>
                  <button style={styles.primaryButton}>Edit Profile</button>
                  <button style={styles.secondaryButton}>Change Password</button>
                  <button style={styles.secondaryButton}>Privacy Settings</button>
                </div>
              </div>
              
              <div style={styles.profileCard}>
                <h3>🏥 Medical Profile</h3>
                <div style={styles.medicalInfo}>
                  <div style={styles.infoItem}>
                    <strong>Blood Group:</strong>
                    <span>O+</span>
                  </div>
                  <div style={styles.infoItem}>
                    <strong>Height:</strong>
                    <span>175 cm</span>
                  </div>
                  <div style={styles.infoItem}>
                    <strong>Weight:</strong>
                    <span>70 kg</span>
                  </div>
                  <div style={styles.infoItem}>
                    <strong>Allergies:</strong>
                    <span>None</span>
                  </div>
                  <div style={styles.infoItem}>
                    <strong>Chronic Conditions:</strong>
                    <span>None</span>
                  </div>
                </div>
                <button style={styles.primaryButton}>Update Medical Info</button>
              </div>
              
              <div style={styles.profileCard}>
                <h3>📱 Contact Information</h3>
                <div style={styles.contactInfo}>
                  <div style={styles.infoItem}>
                    <strong>Mobile:</strong>
                    <span>{state.user.mobile}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <strong>Email:</strong>
                    <span>{state.user.email}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <strong>Emergency Contact:</strong>
                    <span>+919876543211</span>
                  </div>
                </div>
                <button style={styles.primaryButton}>Update Contact</button>
              </div>
              
              <div style={styles.profileCard}>
                <h3>⚙️ Account Settings</h3>
                <div style={styles.settingsList}>
                  <label style={styles.settingItem}>
                    <input type="checkbox" defaultChecked />
                    <span>Appointment Reminders</span>
                  </label>
                  <label style={styles.settingItem}>
                    <input type="checkbox" defaultChecked />
                    <span>Order Updates</span>
                  </label>
                  <label style={styles.settingItem}>
                    <input type="checkbox" />
                    <span>Marketing Emails</span>
                  </label>
                  <label style={styles.settingItem}>
                    <input type="checkbox" defaultChecked />
                    <span>SMS Notifications</span>
                  </label>
                </div>
                <button style={styles.primaryButton}>Save Preferences</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    backgroundColor: 'white',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    height: '64px',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1e40af',
    cursor: 'pointer',
    margin: '0 20px'
  },
  nav: {
    display: 'flex',
    gap: '10px',
    flex: 1,
    flexDirection: 'column',
    position: 'absolute',
    top: '64px',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  navItem: {
    padding: '12px 16px',
    border: 'none',
    background: 'none',
    color: '#64748b',
    cursor: 'pointer',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '16px'
  },
  navItemActive: {
    backgroundColor: '#eff6ff',
    color: '#1e40af'
  },
  navIcon: {
    fontSize: '20px'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  notificationButton: {
    position: 'relative',
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '8px'
  },
  notificationBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    backgroundColor: '#dc2626',
    color: 'white',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cartButton: {
    position: 'relative',
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '8px'
  },
  cartBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    backgroundColor: '#1e40af',
    color: 'white',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#64748b'
  },
  menuButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '8px',
    color: '#64748b'
  },
  main: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  loadingOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #1e40af',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  authContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f9ff',
    padding: '20px'
  },
  authCard: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '440px',
    textAlign: 'center'
  },
  authHeader: {
    marginBottom: '30px'
  },
  authTitle: {
    marginBottom: '30px',
    color: '#1e3a8a',
    fontSize: '24px'
  },
  input: {
    width: '100%',
    padding: '14px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '16px',
    marginBottom: '16px',
    boxSizing: 'border-box'
  },
  authButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '20px',
    fontWeight: 'bold'
  },
  authLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px'
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#1e40af',
    cursor: 'pointer',
    fontSize: '14px'
  },
  authFooter: {
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #e5e7eb'
  },
  footerText: {
    fontSize: '12px',
    color: '#64748b',
    margin: '5px 0'
  },
  otpContainer: {
    marginBottom: '20px'
  },
  otpInput: {
    fontSize: '24px',
    letterSpacing: '10px',
    textAlign: 'center',
    padding: '15px',
    border: '2px solid #1e40af',
    borderRadius: '8px',
    width: '100%',
    boxSizing: 'border-box'
  },
  otpNote: {
    display: 'block',
    marginTop: '8px',
    color: '#64748b',
    fontSize: '14px'
  },
  dashboard: {
    animation: 'fadeIn 0.3s ease-in'
  },
  welcomeSection: {
    marginBottom: '30px',
    textAlign: 'center'
  },
  welcomeText: {
    color: '#64748b',
    marginTop: '5px'
  },
  quickActions: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    marginBottom: '40px',
    flexWrap: 'wrap'
  },
  quickActionButton: {
    padding: '14px 24px',
    backgroundColor: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'transform 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '24px'
  },
  dashboardCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  appointmentCard: {
    borderBottom: '1px solid #e5e7eb',
    padding: '16px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  specialty: {
    color: '#64748b',
    fontSize: '14px'
  },
  appointmentActions: {
    display: 'flex',
    gap: '8px'
  },
  orderCard: {
    borderBottom: '1px solid #e5e7eb',
    padding: '16px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  productItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f1f5f9'
  },
  productIconSmall: {
    fontSize: '20px',
    marginRight: '10px'
  },
  productActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  addButton: {
    padding: '6px 16px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  doctorItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f1f5f9'
  },
  viewAllButton: {
    marginTop: '16px',
    padding: '10px 16px',
    backgroundColor: 'transparent',
    color: '#1e40af',
    border: '1px solid #1e40af',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%'
  },
  emptyState: {
    textAlign: 'center',
    color: '#64748b',
    padding: '40px 0'
  },
  emptyStateIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  section: {
    animation: 'fadeIn 0.3s ease-in'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  appointmentStats: {
    display: 'flex',
    gap: '20px',
    color: '#64748b'
  },
  bookingForm: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    marginBottom: '30px',
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    alignItems: 'flex-end'
  },
  selectInput: {
    padding: '12px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '16px',
    minWidth: '200px'
  },
  selectInputSmall: {
    padding: '8px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px'
  },
  primaryButton: {
    padding: '12px 24px',
    backgroundColor: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  secondaryButton: {
    padding: '12px 24px',
    backgroundColor: 'white',
    color: '#1e40af',
    border: '1px solid #1e40af',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  smallButton: {
    padding: '6px 12px',
    backgroundColor: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  smallButtonDanger: {
    padding: '6px 12px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  smallButtonWarning: {
    padding: '6px 12px',
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  smallButtonInline: {
    padding: '4px 12px',
    backgroundColor: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    marginTop: '8px'
  },
  appointmentsList: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  appointmentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e5e7eb',
    transition: 'background-color 0.2s'
  },
  appointmentInfo: {
    flex: 1
  },
  appointmentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px'
  },
  appointmentFee: {
    color: '#1e40af',
    fontWeight: 'bold'
  },
  appointmentDetails: {
    display: 'flex',
    gap: '10px',
    color: '#64748b',
    fontSize: '14px',
    marginBottom: '8px',
    flexWrap: 'wrap'
  },
  appointmentStatus: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '10px'
  },
  statusBadge: {
    padding: '4px 12px',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'capitalize'
  },
  statusSuccess: {
    backgroundColor: '#d1fae5',
    color: '#065f46'
  },
  statusError: {
    backgroundColor: '#fee2e2',
    color: '#991b1b'
  },
  statusWarning: {
    backgroundColor: '#fef3c7',
    color: '#92400e'
  },
  statusInfo: {
    backgroundColor: '#dbeafe',
    color: '#1e40af'
  },
  statusCompleted: {
    backgroundColor: '#e0f2fe',
    color: '#0c4a6e'
  },
  teleconsultation: {
    animation: 'fadeIn 0.3s ease-in'
  },
  callHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  endCallButton: {
    padding: '12px 24px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  callInterface: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px'
  },
  videoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  },
  videoContainer: {
    backgroundColor: '#1e293b',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  videoPlaceholder: {
    height: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '18px'
  },
  videoLabel: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: '8px 16px',
    borderRadius: '20px'
  },
  videoInfo: {
    padding: '16px',
    backgroundColor: '#0f172a',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between'
  },
  callControls: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginTop: '20px',
    flexWrap: 'wrap'
  },
  controlButton: {
    padding: '12px 24px',
    backgroundColor: '#f1f5f9',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  chatPanel: {
    marginTop: '30px',
    borderTop: '1px solid #e5e7eb',
    paddingTop: '20px'
  },
  chatMessages: {
    height: '200px',
    overflowY: 'auto',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  chatMessage: {
    maxWidth: '70%',
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: '#f3f4f6'
  },
  chatMessageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px'
  },
  chatInput: {
    display: 'flex',
    gap: '10px'
  },
  chatInputField: {
    flex: 1,
    padding: '12px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '16px'
  },
  sendButton: {
    padding: '12px 24px',
    backgroundColor: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  medicalNotes: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  textarea: {
    width: '100%',
    padding: '16px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '16px',
    marginBottom: '16px',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  notesActions: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'flex-end'
  },
  noSession: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  searchBar: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center'
  },
  searchInput: {
    padding: '12px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '16px',
    minWidth: '300px'
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px'
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    transition: 'transform 0.2s'
  },
  productImage: {
    height: '150px',
    backgroundColor: '#f0f9ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px'
  },
  productIconLarge: {
    fontSize: '48px'
  },
  productInfo: {
    padding: '20px'
  },
  productCategory: {
    color: '#64748b',
    fontSize: '14px',
    margin: '8px 0'
  },
  productPrice: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1e40af',
    margin: '8px 0'
  },
  productActions: {
    padding: '0 20px 20px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  addToCartButton: {
    padding: '12px',
    backgroundColor: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  secondaryButtonSmall: {
    padding: '10px',
    backgroundColor: 'white',
    color: '#1e40af',
    border: '1px solid #1e40af',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  clearCartButton: {
    padding: '8px 16px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  emptyCart: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  emptyCartIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  cartLayout: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '30px'
  },
  cartItems: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  cartItem: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gap: '20px',
    padding: '20px 0',
    borderBottom: '1px solid #e5e7eb',
    alignItems: 'center'
  },
  cartItemImage: {
    width: '60px',
    height: '60px',
    backgroundColor: '#f0f9ff',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px'
  },
  cartItemIcon: {
    fontSize: '24px'
  },
  cartItemDetails: {
    flex: 1
  },
  cartItemCategory: {
    color: '#64748b',
    fontSize: '14px',
    margin: '4px 0'
  },
  cartItemPrice: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px'
  },
  stockInfo: {
    color: '#dc2626',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  cartItemActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    alignItems: 'flex-end'
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  quantityButton: {
    width: '32px',
    height: '32px',
    backgroundColor: '#f1f5f9',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  quantityDisplay: {
    minWidth: '40px',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  removeButton: {
    padding: '6px 12px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  cartSummary: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    height: 'fit-content',
    position: 'sticky',
    top: '84px'
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #e5e7eb'
  },
  summaryTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '16px 0',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  checkoutForm: {
    marginTop: '24px'
  },
  addressGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '20px'
  },
  paymentMethods: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px'
  },
  paymentMethod: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  checkoutButton: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    marginBottom: '16px'
  },
  securityNote: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: '12px',
    marginTop: '16px'
  },
  orderStats: {
    display: 'flex',
    gap: '20px',
    color: '#64748b'
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  orderItemCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  orderTracking: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px'
  },
  trackingId: {
    fontFamily: 'monospace',
    backgroundColor: '#f1f5f9',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '14px'
  },
  orderDetails: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '30px',
    marginBottom: '20px'
  },
  orderItemsPreview: {
    paddingRight: '20px',
    borderRight: '1px solid #e5e7eb'
  },
  orderItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    fontSize: '14px'
  },
  moreItems: {
    color: '#64748b',
    fontSize: '12px',
    marginTop: '8px'
  },
  orderProgress: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  progressBar: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    marginBottom: '40px'
  },
  progressBar::before: {
    content: '""',
    position: 'absolute',
    top: '15px',
    left: '0',
    right: '0',
    height: '2px',
    backgroundColor: '#e5e7eb',
    zIndex: 1
  },
  progressStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2
  },
  progressDot: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: '#e5e7eb',
    marginBottom: '8px'
  },
  progressDotActive: {
    backgroundColor: '#1e40af',
    border: '4px solid #dbeafe'
  },
  progressLabel: {
    fontSize: '12px',
    color: '#64748b',
    textTransform: 'capitalize'
  },
  orderMeta: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px'
  },
  orderActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end'
  },
  markAllReadButton: {
    padding: '8px 16px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#64748b'
  },
  notificationsList: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  },
  notificationItem: {
    display: 'flex',
    padding: '20px',
    borderBottom: '1px solid #e5e7eb',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background-color 0.2s'
  },
  notificationUnread: {
    backgroundColor: '#eff6ff'
  },
  notificationIcon: {
    fontSize: '24px',
    marginRight: '16px',
    flexShrink: 0
  },
  notificationContent: {
    flex: 1
  },
  notificationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px'
  },
  unreadDot: {
    width: '12px',
    height: '12px',
    backgroundColor: '#1e40af',
    borderRadius: '50%',
    position: 'absolute',
    right: '20px',
    top: '24px'
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    marginBottom: '30px'
  },
  avatarLarge: {
    width: '100px',
    height: '100px',
    backgroundColor: '#1e40af',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    fontWeight: 'bold'
  },
  userEmail: {
    color: '#64748b',
    margin: '4px 0'
  },
  userRole: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'inline-block'
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '24px'
  },
  profileCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginBottom: '20px'
  },
  statItem: {
    textAlign: 'center',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px'
  },
  profileActions: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap'
  },
  medicalInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px'
  },
  contactInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px'
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #f1f5f9'
  },
  settingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px'
  },
  settingItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer'
  },
  adminContainer: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  },
  adminSidebar: {
    width: '250px',
    backgroundColor: '#1e293b',
    color: 'white',
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 1000,
    transition: 'transform 0.3s',
    overflowY: 'auto'
  },
  sidebarHeader: {
    padding: '20px',
    borderBottom: '1px solid #334155',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sidebarTitle: {
    margin: 0,
    color: 'white'
  },
  closeSidebar: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer'
  },
  adminProfile: {
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    borderBottom: '1px solid #334155'
  },
  adminAvatar: {
    width: '40px',
    height: '40px',
    backgroundColor: '#3b82f6',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
  },
  sidebarNav: {
    padding: '20px 0'
  },
  navButton: {
    width: '100%',
    padding: '12px 20px',
    background: 'none',
    border: 'none',
    color: '#cbd5e1',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '16px',
    transition: 'all 0.2s'
  },
  navButtonActive: {
    backgroundColor: '#334155',
    color: 'white',
    borderLeft: '4px solid #3b82f6'
  },
  sidebarFooter: {
    padding: '20px',
    borderTop: '1px solid #334155',
    position: 'absolute',
    bottom: 0,
    width: '100%'
  },
  adminMain: {
    flex: 1,
    transition: 'margin-left 0.3s',
    minHeight: '100vh'
  },
  adminHeader: {
    backgroundColor: 'white',
    padding: '0 20px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  headerTitle: {
    flex: 1,
    margin: '0 20px'
  },
  adminQuickActions: {
    display: 'flex',
    gap: '10px',
    marginRight: '20px'
  },
  primaryButtonSmall: {
    padding: '8px 16px',
    backgroundColor: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  adminContent: {
    padding: '20px'
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px'
  },
  statsCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '10px 0'
  },
  statChange: {
    color: '#10b981',
    fontSize: '14px'
  },
  doctorStatus: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f1f5f9'
  },
  statusDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%'
  },
  alertItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f1f5f9',
    color: '#dc2626'
  },
  chartPlaceholder: {
    height: '200px',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b'
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableTh: {
    padding: '16px',
    textAlign: 'left',
    backgroundColor: '#f8fafc',
    fontWeight: 'bold',
    color: '#64748b',
    borderBottom: '1px solid #e5e7eb'
  },
  tableTd: {
    padding: '16px',
    borderBottom: '1px solid #e5e7eb'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px'
  },
  doctorsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px'
  },
  doctorCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  doctorHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '20px'
  },
  doctorAvatar: {
    width: '60px',
    height: '60px',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '20px'
  },
  doctorDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '20px'
  },
  cardActions: {
    display: 'flex',
    gap: '10px'
  },
  formCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    marginBottom: '30px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  },
  formActions: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'flex-end'
  },
  ordersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '24px'
  },
  orderCardAdmin: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  productRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  statusSelect: {
    padding: '6px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '14px'
  },
  notificationsPanel: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  }
};

export default App;
