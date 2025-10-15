import React, { useState, useEffect, useRef } from 'react';
import { Send, Menu, X, MessageSquare, Ticket, Users, BarChart3, Settings, Bell, Search, Filter, Download, CheckCircle, Clock, AlertCircle, User, Mail, Phone, Zap, TrendingUp, Database, Shield, Cpu, HardDrive, Key, UserCog, Crown, Activity, FileText, Target, Award, LogOut } from 'lucide-react';

import LOGO from './assets/Logo.png'

const GEMINI_API_KEY = 'AIzaSyCRbfVgO9jy8MIOP_FVWlOLBJ0uMKu_5h4';

const generateInitialTickets = () => {
  const categories = [
    { name: 'Network & Connectivity', color: 'bg-gray-600', icon: '🌐', team: 'Network Team' },
    { name: 'Security & Compliance', color: 'bg-purple-600', icon: '🔒', team: 'Security Team' },
    { name: 'Software/Application Issues', color: 'bg-pink-600', icon: '💻', team: 'Application Team' },
    { name: 'Hardware Issues', color: 'bg-yellow-600', icon: '🔧', team: 'Hardware Team' },
    { name: 'Account & Access Management', color: 'bg-cyan-600', icon: '👤', team: 'IAM Team' }
  ];
  
  const priorities = ['High', 'Medium', 'Low'];
  const statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
  const sources = ['Chatbot', 'Email', 'GLPI', 'Solman'];
  
  const sampleIssues = [
    'Unable to connect to VPN',
    'Password reset required',
    'Email not syncing',
    'Software installation request',
    'Network printer not working',
    'Account locked',
    'Slow internet connection',
    'Application crashing',
    'Hardware replacement needed',
    'Security clearance request'
  ];
  
  return Array.from({ length: 25 }, (_, i) => {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    return {
      id: `TKT${String(i + 1001).padStart(6, '0')}`,
      title: sampleIssues[Math.floor(Math.random() * sampleIssues.length)],
      description: 'Issue description details...',
      category: category.name,
      categoryColor: category.color,
      team: category.team,
      priority,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      assignedTo: `Agent ${Math.floor(Math.random() * 5) + 1}`,
      userName: `Employee ${i + 1}`,
      userEmail: `emp${i + 1}@powergrid.in`
    };
  });
};

const App = () => {
  const [activeView, setActiveView] = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tickets, setTickets] = useState(generateInitialTickets());
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! I\'m your POWERGRID IT Support Assistant. How can I help you today?', timestamp: new Date() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userRole, setUserRole] = useState('employee');
  const [selectedDomain, setSelectedDomain] = useState('Network Team');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [showRoleSelector, setShowRoleSelector] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const classifyTicket = async (userMessage) => {
    const lowercaseMsg = userMessage.toLowerCase();
    
    let category = 'Software/Application Issues';
    let priority = 'Medium';
    
    if (lowercaseMsg.includes('urgent') || lowercaseMsg.includes('critical') || 
        lowercaseMsg.includes('down') || lowercaseMsg.includes('not working')) {
      priority = 'High';
    } else if (lowercaseMsg.includes('whenever') || lowercaseMsg.includes('not urgent')) {
      priority = 'Low';
    }
    
    if (lowercaseMsg.includes('network') || lowercaseMsg.includes('internet') || 
        lowercaseMsg.includes('wifi') || lowercaseMsg.includes('vpn') || 
        lowercaseMsg.includes('connection')) {
      category = 'Network & Connectivity';
    } else if (lowercaseMsg.includes('password') || lowercaseMsg.includes('login') || 
               lowercaseMsg.includes('access') || lowercaseMsg.includes('account')) {
      category = 'Account & Access Management';
    } else if (lowercaseMsg.includes('security') || lowercaseMsg.includes('virus') || 
               lowercaseMsg.includes('malware') || lowercaseMsg.includes('compliance')) {
      category = 'Security & Compliance';
    } else if (lowercaseMsg.includes('laptop') || lowercaseMsg.includes('printer') || 
               lowercaseMsg.includes('mouse') || lowercaseMsg.includes('keyboard') ||
               lowercaseMsg.includes('hardware')) {
      category = 'Hardware Issues';
    }

    return { category, priority };
  };

  const getAIResponse = async (userMessage) => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful IT support assistant for POWERGRID. Respond professionally and concisely to: "${userMessage}". If it's a common IT issue (password reset, VPN, email), provide quick troubleshooting steps. Keep response under 100 words.`
            }]
          }]
        })
      });

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      return "I understand your concern. Let me create a ticket for our support team to assist you further.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { type: 'user', text: userMsg, timestamp: new Date() }]);
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const { category, priority } = await classifyTicket(userMsg);

    const lowercaseMsg = userMsg.toLowerCase();
    const isSimpleQuery = lowercaseMsg.includes('password reset') || 
                          lowercaseMsg.includes('reset password') ||
                          lowercaseMsg.includes('forgot password');

    if (isSimpleQuery) {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'I can help you with that right away! To reset your password:\n\n1. Visit https://portal.powergrid.in/reset\n2. Enter your employee ID\n3. Verify via OTP sent to your registered mobile\n4. Set your new password\n\nYour issue has been auto-resolved. Would you like me to create a ticket for documentation?',
        timestamp: new Date()
      }]);
      return;
    }

    const aiResponse = await getAIResponse(userMsg);
    
    setIsTyping(false);
    setMessages(prev => [...prev, {
      type: 'bot',
      text: aiResponse,
      timestamp: new Date()
    }]);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        type: 'bot',
        text: `I've classified this as a "${category}" issue with "${priority}" priority. Would you like me to create a ticket for our ${getCategoryTeam(category)}?`,
        timestamp: new Date(),
        actions: [
          { label: 'Yes, Create Ticket', action: 'create-ticket', data: { category, priority, description: userMsg } },
          { label: 'No, Thanks', action: 'dismiss' }
        ]
      }]);
    }, 1000);
  };

  const getCategoryTeam = (category) => {
    const teams = {
      'Network & Connectivity': 'Network Team',
      'Security & Compliance': 'Security Team',
      'Software/Application Issues': 'Application Team',
      'Hardware Issues': 'Hardware Team',
      'Account & Access Management': 'IAM Team'
    };
    return teams[category] || 'Support Team';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Network & Connectivity': 'bg-gray-600',
      'Security & Compliance': 'bg-purple-600',
      'Software/Application Issues': 'bg-pink-600',
      'Hardware Issues': 'bg-yellow-600',
      'Account & Access Management': 'bg-cyan-600'
    };
    return colors[category] || 'bg-blue-600';
  };

  const handleAction = (action, data) => {
    if (action === 'create-ticket') {
      const newTicket = {
        id: `TKT${String(tickets.length + 1001).padStart(6, '0')}`,
        title: data.description.substring(0, 50) + '...',
        description: data.description,
        category: data.category,
        categoryColor: getCategoryColor(data.category),
        team: getCategoryTeam(data.category),
        priority: data.priority,
        status: 'Open',
        source: 'Chatbot',
        createdAt: new Date().toISOString(),
        assignedTo: 'Auto-assigned',
        userName: 'Current User',
        userEmail: 'user@powergrid.in'
      };
      
      setTickets(prev => [newTicket, ...prev]);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: `✅ Ticket created successfully!\n\nTicket ID: ${newTicket.id}\nCategory: ${newTicket.category}\nPriority: ${newTicket.priority}\nAssigned to: ${newTicket.team}\n\nYou'll receive email and SMS notifications on updates.`,
        timestamp: new Date()
      }]);
    } else {
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'No problem! Feel free to ask if you need anything else.',
        timestamp: new Date()
      }]);
    }
  };

  const handleTicketUpdate = (ticketId, updates) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ...updates } : t));
    setSelectedTicket(prev => prev?.id === ticketId ? { ...prev, ...updates } : prev);
  };

  const filteredTickets = tickets.filter(ticket => {
    const categoryMatch = filterCategory === 'All' || ticket.category === filterCategory;
    const priorityMatch = filterPriority === 'All' || ticket.priority === filterPriority;
    const domainMatch = userRole === 'domain-admin' ? ticket.team === selectedDomain : true;
    return categoryMatch && priorityMatch && domainMatch;
  });

  const stats = {
    totalTickets: userRole === 'domain-admin' ? tickets.filter(t => t.team === selectedDomain).length : tickets.length,
    openTickets: userRole === 'domain-admin' ? 
      tickets.filter(t => t.status === 'Open' && t.team === selectedDomain).length :
      tickets.filter(t => t.status === 'Open').length,
    inProgress: userRole === 'domain-admin' ?
      tickets.filter(t => t.status === 'In Progress' && t.team === selectedDomain).length :
      tickets.filter(t => t.status === 'In Progress').length,
    resolved: userRole === 'domain-admin' ?
      tickets.filter(t => (t.status === 'Resolved' || t.status === 'Closed') && t.team === selectedDomain).length :
      tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length,
    avgResolutionTime: '4.5 hrs',
    satisfactionRate: '94%'
  };

  if (showRoleSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img src={LOGO} alt="Logo..." className='h-auto w-[100px]'/>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">POWERGRID IT Support System</h1>
            <div className='w-full flex justify-center mb-3'>
              <div className='bg-green-400 p-3 rounded-2xl cursor-pointer hover:bg-green-500 transition-all duration-500 hover:scale-105'>
                <h1 className='text-center font-mono text-2xl'>Powered by IGrid</h1>
              </div>
            </div>
            <p className="text-gray-600">Smart Helpdesk Ticketing Solution - Select Your Role</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => {
                setUserRole('employee');
                setShowRoleSelector(false);
                setActiveView('chat');
              }}
              className="group bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl p-6 shadow-lg transition-all transform hover:scale-105"
            >
              <User className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Employee</h3>
              <p className="text-sm text-blue-100">Access chatbot and raise tickets</p>
            </button>

            <button
              onClick={() => {
                setUserRole('domain-admin');
                setShowRoleSelector(false);
                setActiveView('domain-dashboard');
              }}
              className="group bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl p-6 shadow-lg transition-all transform hover:scale-105"
            >
              <UserCog className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Domain Admin</h3>
              <p className="text-sm text-purple-100">Manage your team's tickets</p>
            </button>

            <button
              onClick={() => {
                setUserRole('overall-admin');
                setShowRoleSelector(false);
                setActiveView('overall-dashboard');
              }}
              className="group bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl p-6 shadow-lg transition-all transform hover:scale-105"
            >
              <Crown className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Overall Admin</h3>
              <p className="text-sm text-orange-100">Monitor all operations</p>
            </button>
          </div>

          <div className="mt-[40px] grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-lg shadow-[2px_3px_7px_2px] shadow-black">
              <p className="text-2xl font-bold text-blue-600">5</p>
              <p className="text-xs text-gray-600">Support Teams</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg shadow-[2px_3px_7px_2px] shadow-black">
              <p className="text-2xl font-bold text-green-600">{tickets.length}</p>
              <p className="text-xs text-gray-600">Total Tickets</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg shadow-[2px_3px_7px_2px] shadow-black">
              <p className="text-2xl font-bold text-purple-600">94%</p>
              <p className="text-xs text-gray-600">Satisfaction</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg shadow-[2px_3px_7px_2px] shadow-black">
              <p className="text-2xl font-bold text-orange-600">4.5h</p>
              <p className="text-xs text-gray-600">Avg Resolution</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg shadow-[2px_3px_7px_2px] shadow-black">
              <p className="text-2xl font-bold text-cyan-600">24/7</p>
              <p className="text-xs text-gray-600">AI Support</p>
            </div>
          </div>


          {/* <div className='w-full flex justify-center'>
            <div className='flex gap-4 rounded-2xl bg-green-300 h-[80px] flex justify-center items-center p-4'>
              <div>
                <h1>Creators:</h1>
              </div>
              <div className='w-[120px] p-1 bg-amber-400 rounded-2xl flex justify-center items-center shadow-black shadow-[0_0_6px_2px]'>
                <h1 className='text-center'>Sagnik Sarkar</h1>
              </div>
              <div className='shadow-black shadow-[0_0_6px_2px] w-[120px] p-1 bg-amber-400 rounded-2xl flex justify-center items-center'>
                <h1 className='text-center'>Aman Gupta</h1>
              </div>
              <div className='shadow-black shadow-[0_0_6px_2px] w-[120px] p-1 bg-amber-400 rounded-2xl flex justify-center items-center'>
                <h1 className='text-center'>Gourab Das</h1>
              </div>
            </div>
          </div> */}



          <div className="w-full flex justify-center py-6 mt-[20px]">
            <div className="flex gap-6 rounded-3xl bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-700/40 h-[90px] justify-center items-center px-6 cursor-pointer hover:scale-105 transition-all duration-500">
              <h1 className="text-black text-xl font-semibold tracking-wide">Creators:</h1>
              
              {["Sagnik Sarkar", "Aman Gupta", "Gourab Das"].map((name, idx) => (
                <div
                  key={idx}
                  className="bg-amber-400 hover:bg-amber-300 transition-all duration-300 ease-in-out text-gray-800 font-medium rounded-2xl px-4 py-2 flex justify-center items-center shadow-md shadow-black/30 hover:scale-105"
                >
                  <h1 className="text-center text-sm sm:text-base cursor-pointer font-bold">{name}</h1>
                </div>
              ))}
            </div>
          </div>


        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} ${
        userRole === 'employee' ? 'bg-gradient-to-b from-blue-900 to-blue-800' :
        userRole === 'domain-admin' ? 'bg-gradient-to-b from-purple-900 to-purple-800' :
        'bg-gradient-to-b from-orange-900 to-orange-800'
      } text-white transition-all duration-300 overflow-hidden flex-shrink-0`}>
        <div className="p-4 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <Zap className="w-8 h-8 text-yellow-400" />
              <div>
                <h1 className="text-[22px] font-bold">POWERGRID</h1>
                <p className="text-xs opacity-80">
                  {userRole === 'employee' ? 'Employee' :
                   userRole === 'domain-admin' ? 'Domain Admin' :
                   'Overall Admin'}
                </p>
              </div>
            </div>
          </div>

          {userRole === 'domain-admin' && (
            <div className="mb-6 p-3 bg-gray-400 bg-opacity-10 rounded-lg">
              <label className="text-xl opacity-80 mb-2 block font-bold text-black text-center">Your Team</label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full px-3 text-[18px] font-sans py-2 bg-white bg-opacity-20 text-black rounded-lg text-sm focus:outline-none"
              >
                <option>Network Team</option>
                <option>Security Team</option>
                <option>Application Team</option>
                <option>Hardware Team</option>
                <option>IAM Team</option>
              </select>
            </div>
          )}
          
          <nav className="space-y-2">
            {userRole === 'employee' && (
              <>
                <button
                  onClick={() => setActiveView('chat')}
                  className={`w-full flex text-[18px] font-sans items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    activeView === 'chat' ? 'bg-gray-300 text-black bg-opacity-20' : 'hover:bg-white hover:text-black hover:bg-opacity-10'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>AI Chat Support</span>
                </button>
                
                <button
                  onClick={() => setActiveView('tickets')}
                  className={`w-full flex text-[18px] font-sans items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    activeView === 'tickets' ? 'bg-gray-300 text-black bg-opacity-20' : 'hover:bg-gray-300 hover:text-black hover:bg-opacity-10'
                  }`}
                >
                  <Ticket className="w-5 h-5" />
                  <span>My Tickets</span>
                </button>
              </>
            )}

            {userRole === 'domain-admin' && (
              <>
                <button
                  onClick={() => setActiveView('domain-dashboard')}
                  className={`w-full text-[18px] font-sans flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    activeView === 'domain-dashboard' ? 'bg-white text-black bg-opacity-20' : 'hover:bg-gray-300 hover:text-black hover:bg-opacity-10'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Team Dashboard</span>
                </button>
                
                <button
                  onClick={() => setActiveView('domain-tickets')}
                  className={`w-full text-[18px] font-sans flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    activeView === 'domain-tickets' ? 'bg-white text-black bg-opacity-20' : 'hover:bg-white hover:text-black hover:bg-opacity-10'
                  }`}
                >
                  <Ticket className="w-5 h-5" />
                  <span>Team Tickets</span>
                </button>

                <button
                  onClick={() => setActiveView('domain-agents')}
                  className={`w-full flex items-center space-x-3 text-[18px] font-sans px-4 py-3 rounded-lg transition ${
                    activeView === 'domain-agents' ? 'bg-white text-black bg-opacity-20' : 'hover:bg-white hover:text-black hover:bg-opacity-10'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span>Team Members</span>
                </button>
              </>
            )}

            {userRole === 'overall-admin' && (
              <>
                <button
                  onClick={() => setActiveView('overall-dashboard')}
                  className={`w-full flex items-center text-[18px] font-sans space-x-3 px-4 py-3 rounded-lg transition ${
                    activeView === 'overall-dashboard' ? 'bg-white text-black bg-opacity-20' : 'hover:bg-white hover:text-black  hover:bg-opacity-10'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Overview</span>
                </button>
                
                <button
                  onClick={() => setActiveView('overall-teams')}
                  className={`w-full flex items-center text-[18px] space-x-3 px-4 py-3 rounded-lg transition ${
                    activeView === 'overall-teams' ? 'bg-white text-black bg-opacity-20' : 'hover:bg-white hover:text-black hover:bg-opacity-10'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span>All Teams</span>
                </button>

                <button
                  onClick={() => setActiveView('overall-tickets')}
                  className={`w-full flex items-center text-[18px] space-x-3 px-4 py-3 rounded-lg transition ${
                    activeView === 'overall-tickets' ? 'bg-white text-black bg-opacity-20' : 'hover:bg-white hover:text-black hover:bg-opacity-10'
                  }`}
                >
                  <Ticket className="w-5 h-5" />
                  <span>All Tickets</span>
                </button>

                <button
                  onClick={() => setActiveView('overall-settings')}
                  className={`w-full flex items-center text-[18px] space-x-3 px-4 py-3 rounded-lg transition ${
                    activeView === 'overall-settings' ? 'bg-white text-black bg-opacity-20' : 'hover:bg-white hover:text-black hover:bg-opacity-10'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>
              </>
            )}
          </nav>

          <button
            onClick={() => setShowRoleSelector(true)}
            className="mt-8 w-full px-4 py-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition text-sm flex text-[17px] cursor-pointer hover:scale-105 transition-all duration-500 items-center text-black justify-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Switch Role</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600 hover:text-gray-900">
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {activeView === 'chat' && 'AI Chat Support'}
                  {activeView === 'tickets' && 'My Tickets'}
                  {activeView === 'domain-dashboard' && `${selectedDomain} Dashboard`}
                  {activeView === 'domain-tickets' && `${selectedDomain} Tickets`}
                  {activeView === 'domain-agents' && `${selectedDomain} Members`}
                  {activeView === 'overall-dashboard' && 'System Overview'}
                  {activeView === 'overall-teams' && 'All Support Teams'}
                  {activeView === 'overall-tickets' && 'All Tickets'}
                  {activeView === 'overall-settings' && 'System Settings'}
                </h2>
                <p className="text-sm text-gray-500">Smart Helpdesk Ticketing Solution</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">
                    {userRole === 'employee' ? 'Employee User' :
                     userRole === 'domain-admin' ? 'Domain Admin' :
                     'System Admin'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userRole === 'employee' ? 'emp@powergrid.in' :
                     userRole === 'domain-admin' ? 'admin@powergrid.in' :
                     'superadmin@powergrid.in'}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                  userRole === 'employee' ? 'bg-blue-600' :
                  userRole === 'domain-admin' ? 'bg-purple-600' :
                  'bg-orange-600'
                }`}>
                  {userRole === 'employee' ? 'EU' :
                   userRole === 'domain-admin' ? 'DA' :
                   'SA'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {activeView === 'chat' && (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-auto p-6 space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-2xl ${msg.type === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'} rounded-lg p-4 shadow-sm`}>
                      <p className="whitespace-pre-line">{msg.text}</p>
                      {msg.actions && (
                        <div className="mt-3 flex space-x-2">
                          {msg.actions.map((action, i) => (
                            <button
                              key={i}
                              onClick={() => handleAction(action.action, action.data)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                action.action === 'create-ticket'
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                              }`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                      <p className="text-xs opacity-70 mt-2">{msg.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="border-t border-gray-200 bg-white p-4 flex-shrink-0">
                <div className="max-w-4xl mx-auto">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Describe your IT issue..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
                    >
                      <Send className="w-5 h-5" />
                      <span>Send</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    🤖 Powered by AI • Instant classification • Auto-routing to support teams
                  </p>
                </div>
              </div>
            </div>
          )}

          {(activeView === 'tickets' || activeView === 'domain-tickets' || activeView === 'overall-tickets') && (
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex space-x-4">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>All</option>
                    <option>Network & Connectivity</option>
                    <option>Security & Compliance</option>
                    <option>Software/Application Issues</option>
                    <option>Hardware Issues</option>
                    <option>Account & Access Management</option>
                  </select>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>All</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>

              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTickets.map(ticket => (
                      <tr key={ticket.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                        <td className="px-6 py-4 text-sm font-medium text-blue-600">{ticket.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{ticket.title}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium text-white rounded ${ticket.categoryColor}`}>
                            {ticket.category.split(' ')[0]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            ticket.priority === 'High' ? 'bg-red-100 text-red-800' :
                            ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            ticket.status === 'Open' ? 'bg-blue-100 text-blue-800' :
                            ticket.status === 'In Progress' ? 'bg-purple-100 text-purple-800' :
                            ticket.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === 'domain-dashboard' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <Ticket className="w-10 h-10 opacity-80" />
                    <span className="text-3xl font-bold">{stats.totalTickets}</span>
                  </div>
                  <p className="text-purple-100">Team Tickets</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <AlertCircle className="w-10 h-10 opacity-80" />
                    <span className="text-3xl font-bold">{stats.openTickets}</span>
                  </div>
                  <p className="text-orange-100">Open</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <Clock className="w-10 h-10 opacity-80" />
                    <span className="text-3xl font-bold">{stats.inProgress}</span>
                  </div>
                  <p className="text-blue-100">In Progress</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <CheckCircle className="w-10 h-10 opacity-80" />
                    <span className="text-3xl font-bold">{stats.resolved}</span>
                  </div>
                  <p className="text-green-100">Resolved</p>
                </div>
              </div>
            </div>
          )}

          {activeView === 'domain-agents' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {['Agent 1', 'Agent 2', 'Agent 3', 'Agent 4', 'Agent 5'].map((agent, idx) => {
                  const agentTickets = tickets.filter(t => t.assignedTo === agent && t.team === selectedDomain);
                  return (
                    <div key={idx} className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                          A{idx + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{agent}</h3>
                          <p className="text-sm text-gray-500">{selectedDomain}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Active Tickets</span>
                          <span className="font-semibold text-gray-800">{agentTickets.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Resolved Today</span>
                          <span className="font-semibold text-green-600">{Math.floor(Math.random() * 5) + 1}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeView === 'overall-dashboard' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <Ticket className="w-10 h-10 opacity-80" />
                    <span className="text-3xl font-bold">{tickets.length}</span>
                  </div>
                  <p className="text-blue-100">Total Tickets</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-10 h-10 opacity-80" />
                    <span className="text-3xl font-bold">5</span>
                  </div>
                  <p className="text-orange-100">Support Teams</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <CheckCircle className="w-10 h-10 opacity-80" />
                    <span className="text-3xl font-bold">94%</span>
                  </div>
                  <p className="text-green-100">Satisfaction</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <Zap className="w-10 h-10 opacity-80" />
                    <span className="text-3xl font-bold">4.5h</span>
                  </div>
                  <p className="text-purple-100">Avg Resolution</p>
                </div>
              </div>
            </div>
          )}

          {activeView === 'overall-teams' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[
                  { name: 'Network Team', icon: '🌐', color: 'from-gray-500 to-gray-600', category: 'Network & Connectivity' },
                  { name: 'Security Team', icon: '🔒', color: 'from-purple-500 to-purple-600', category: 'Security & Compliance' },
                  { name: 'Application Team', icon: '💻', color: 'from-pink-500 to-pink-600', category: 'Software/Application Issues' },
                  { name: 'Hardware Team', icon: '🔧', color: 'from-yellow-500 to-yellow-600', category: 'Hardware Issues' },
                  { name: 'IAM Team', icon: '👤', color: 'from-cyan-500 to-cyan-600', category: 'Account & Access Management' }
                ].map((team, idx) => {
                  const teamTickets = tickets.filter(t => t.team === team.name);
                  const openCount = teamTickets.filter(t => t.status === 'Open').length;
                  const resolvedCount = teamTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
                  return (
                    <div key={idx} className={`bg-gradient-to-br ${team.color} text-white rounded-lg p-6 shadow-lg`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-4xl">{team.icon}</div>
                          <div>
                            <h3 className="text-xl font-bold">{team.name}</h3>
                            <p className="text-sm opacity-80">{team.category}</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-2xl font-bold">{teamTickets.length}</p>
                          <p className="text-xs opacity-80">Total</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{openCount}</p>
                          <p className="text-xs opacity-80">Open</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{resolvedCount}</p>
                          <p className="text-xs opacity-80">Resolved</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeView === 'overall-settings' && (
            <div className="p-6 space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Email & SMS Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Server</label>
                    <input type="text" defaultValue="smtp.powergrid.in" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMS Gateway API</label>
                    <input type="text" defaultValue="https://sms.powergrid.in/api" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-orange-600" />
                    <label className="text-sm text-gray-700">Send email on ticket creation</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-orange-600" />
                    <label className="text-sm text-gray-700">Send SMS for high priority tickets</label>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">AI Model</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option>Gemini Pro</option>
                      <option>GPT-4</option>
                      <option>Claude</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-orange-600" />
                    <label className="text-sm text-gray-700">Enable auto-resolution for common issues</label>
                  </div>
                </div>
              </div>

              <button className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold">
                Save All Settings
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-90vh overflow-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Ticket Details</h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Ticket ID</p>
                  <p className="text-lg font-bold text-blue-600">{selectedTicket.id}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded ${
                  selectedTicket.status === 'Open' ? 'bg-blue-100 text-blue-800' :
                  selectedTicket.status === 'In Progress' ? 'bg-purple-100 text-purple-800' :
                  selectedTicket.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedTicket.status}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Title</p>
                <p className="text-base font-semibold text-gray-800">{selectedTicket.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Category</p>
                  <span className={`inline-block px-3 py-1 text-sm font-medium text-white rounded ${selectedTicket.categoryColor}`}>
                    {selectedTicket.category}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Priority</p>
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded ${
                    selectedTicket.priority === 'High' ? 'bg-red-100 text-red-800' :
                    selectedTicket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedTicket.priority}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Team</p>
                  <p className="text-base font-medium text-gray-800">{selectedTicket.team}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Source</p>
                  <p className="text-base font-medium text-gray-800">{selectedTicket.source}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Notifications</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>Email sent to {selectedTicket.userEmail}</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>SMS alert sent</span>
                    <span className="text-green-600">✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;