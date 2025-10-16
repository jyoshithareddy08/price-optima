import React, { useMemo, useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Upload,
  Button,
  Table,
  Card,
  Row,
  Col,
  Statistic,
  message,
  Input,
  Space,
  Alert,
  ConfigProvider,
  theme,
  Tag,
  Progress,
  Segmented,
  Tooltip,
  Badge,
  Divider
} from 'antd';
import { 
  UploadOutlined, 
  ReloadOutlined, 
  BulbOutlined,
  RocketOutlined,
  DashboardOutlined,
  LineChartOutlined,
  TableOutlined,
  CodeOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  RiseOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area
} from 'recharts';

const { Header, Content, Footer, Sider } = Layout;
const { Title, Text } = Typography;

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

function App() {
  const [health, setHealth] = useState(null);
  const [rows, setRows] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [singleResponse, setSingleResponse] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Form state - updated to match API expectations
  const [formData, setFormData] = useState({
    Historical_Cost_of_Ride: 250,
    Expected_Ride_Duration: 35,
    Number_of_Riders: 120,
    Number_of_Drivers: 100,
    Vehicle_Type: 'Economy',
    Time_of_Booking: 'Evening',
    Location_Category: 'Urban',
    Customer_Loyalty_Status: 'Silver',
    competitor_price: 360
  });

  // Modern gradient themes
  const darkTheme = {
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: '#7c3aed',
      colorBgBase: '#0f0f23',
      colorTextBase: '#ffffff',
      colorBgContainer: '#1a1a2e',
      colorBorder: '#2d2d4d',
      colorPrimaryBg: '#1e1b4b',
      borderRadius: 12,
      wireframe: false,
    },
  };

  const lightTheme = {
    algorithm: theme.defaultAlgorithm,
    token: {
      colorPrimary: '#7c3aed',
      colorBgBase: '#f8fafc',
      colorTextBase: '#1e293b',
      colorBgContainer: '#ffffff',
      colorBorder: '#e2e8f0',
      colorPrimaryBg: '#f5f3ff',
      borderRadius: 12,
      wireframe: false,
    },
  };

  const checkHealth = async () => {
    setHealthLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/health`);
      setHealth(response.data);
      message.success('🚀 API Connected Successfully');
    } catch (error) {
      setHealth(null);
      message.error('💥 API Connection Failed');
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Enhanced single test with better error handling
  const handleTestSingle = async () => {
    setLoading(true);
    setServerError(null);
    setSingleResponse(null);
    try {
      const payload = { record: formData };
      const { data } = await axios.post(`${API_BASE}/recommend`, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000, // Add timeout
      });
      
      // Validate response structure
      if (!data.price_recommended) {
        throw new Error('Invalid response from server');
      }
      
      setSingleResponse(data);
      message.success(`🚀 AI Recommendation: ₹${data.price_recommended}`);
    } catch (e) {
      console.error('Single test error:', e);
      let errorMessage = 'Server error';
      
      if (e.response?.data?.detail) {
        errorMessage = e.response.data.detail;
      } else if (e.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to API server';
      } else if (e.message.includes('timeout')) {
        errorMessage = 'Request timeout - server is taking too long to respond';
      }
      
      setServerError(errorMessage);
      message.error('❌ Failed to get recommendation');
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        title: '📊 Index',
        dataIndex: 'index',
        width: 80,
        render: (text) => (
          <Tag color={darkMode ? 'purple' : 'blue'} style={{ fontWeight: 'bold' }}>
            #{text}
          </Tag>
        )
      },
      {
        title: '💎 Recommended Price',
        dataIndex: 'price_recommended',
        render: (v) => (
          <Text strong style={{ color: '#10b981', fontSize: '14px' }}>
            ₹{v?.toFixed(2)}
          </Text>
        )
      },
      {
        title: '🎯 Completion (Reco)',
        dataIndex: 'p_complete_recommended',
        render: (v) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Progress 
              percent={Math.round(v * 100)} 
              size="small" 
              strokeColor={{
                '0%': '#7c3aed',
                '100%': '#ec4899',
              }}
              showInfo={false}
            />
            <Text style={{ color: '#7c3aed', fontWeight: 600 }}>
              {(v * 100).toFixed(1)}%
            </Text>
          </div>
        )
      },
      {
        title: '📈 GM %',
        dataIndex: 'gm_pct',
        render: (v) => (
          <Badge 
            count={v?.toFixed(1) + '%'} 
            style={{ 
              backgroundColor: v > 20 ? '#10b981' : v > 10 ? '#f59e0b' : '#ef4444',
              fontWeight: 'bold'
            }}
          />
        )
      },
      {
        title: '⚡ Status',
        dataIndex: 'error',
        render: (v) => 
          v ? (
            <Tag icon={<WarningOutlined />} color="red">
              {v}
            </Tag>
          ) : (
            <Tag icon={<CheckCircleOutlined />} color="green">
              Optimized
            </Tag>
          )
      },
    ],
    [darkMode]
  );

  const chartData = useMemo(() => {
    return rows
      .filter(row => !row.error)
      .map((r, i) => ({
        name: `#${i + 1}`,
        price: typeof r.price_recommended === 'number' ? r.price_recommended : null,
        gm: typeof r.gm_pct === 'number' ? r.gm_pct : null,
        completion: typeof r.p_complete_recommended === 'number' ? r.p_complete_recommended * 100 : null,
      }));
  }, [rows]);

  const normalizeRowsFromServer = (rawRows = []) => {
    return rawRows.map((r, i) => {
      const idx = Number.isFinite(r.index) ? r.index : i;
      return {
        index: idx,
        price_recommended: r.price_recommended !== undefined ? Number(r.price_recommended) : undefined,
        p_complete_recommended: r.p_complete_recommended !== undefined ? Number(r.p_complete_recommended) : undefined,
        p_complete_baseline: r.p_complete_baseline !== undefined ? Number(r.p_complete_baseline) : undefined,
        gm_pct: r.gm_pct !== undefined ? Number(r.gm_pct) : undefined,
        bound_low: r.bound_low !== undefined ? Number(r.bound_low) : undefined,
        bound_high: r.bound_high !== undefined ? Number(r.bound_high) : undefined,
        error: r.error || null,
      };
    });
  };

  // Enhanced CSV upload with better error handling
  const onUpload = async (file) => {
    setLoading(true);
    setServerError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const { data } = await axios.post(`${API_BASE}/recommend_batch`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });

      // Enhanced validation for new API response
      if (!data.rows || !Array.isArray(data.rows)) {
        throw new Error('Invalid response format from server');
      }

      const normalized = normalizeRowsFromServer(data.rows || []);
      setRows(normalized);
      setKpis(data.kpis || null);
      
      const successCount = normalized.filter(r => !r.error).length;
      const errorCount = normalized.filter(r => r.error).length;
      
      if (errorCount > 0) {
        message.warning(`Processed ${successCount} records, ${errorCount} had errors`);
      } else {
        message.success(`🎉 Successfully processed ${successCount} records`);
      }
      
    } catch (e) {
      console.error('Upload error:', e);
      let errorDetail = 'Failed to process CSV';
      
      if (e.response?.data?.detail) {
        errorDetail = e.response.data.detail;
      } else if (e.code === 'ECONNABORTED') {
        errorDetail = 'Request timeout - file too large or server busy';
      } else if (e.message.includes('Network Error')) {
        errorDetail = 'Cannot connect to API server';
      }
      
      setServerError(errorDetail);
      message.error('❌ Failed to process CSV');
    } finally {
      setLoading(false);
    }
    return false;
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    message.info(`🌙 ${darkMode ? 'Light' : 'Dark'} mode activated`);
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'AI Dashboard',
    },
    {
      key: 'analytics',
      icon: <LineChartOutlined />,
      label: 'Analytics',
    },
    {
      key: 'batch',
      icon: <TableOutlined />,
      label: 'Batch Processing',
    },
    {
      key: 'single',
      icon: <CodeOutlined />,
      label: 'Single Test',
    },
  ];

  const renderDashboard = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Hero Stats Card */}
      <Card 
        style={{ 
          background: darkMode 
            ? 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)' 
            : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
          border: 'none',
          borderRadius: 20,
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: 24 }}>
          <Row gutter={24} align="middle">
            <Col span={12}>
              <Title level={2} style={{ color: 'white', margin: 0 }}>
                AI Pricing Intelligence
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>
                Real-time dynamic pricing optimization powered by machine learning
              </Text>
            </Col>
            <Col span={12}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="API Status"
                    value={health?.ok ? 'Connected' : 'Offline'}
                    valueStyle={{ color: health?.ok ? '#10b981' : '#ef4444', fontSize: 18 }}
                    prefix={health?.ok ? <CheckCircleOutlined /> : <WarningOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Revenue Lift"
                    value={kpis?.['Revenue Lift (%)'] ?? '0.00'}
                    suffix="%"
                    valueStyle={{ color: '#f59e0b', fontSize: 18 }}
                    prefix={<RiseOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Records"
                    value={rows.filter(r => !r.error).length}
                    valueStyle={{ color: '#7c3aed', fontSize: 18 }}
                    prefix={<TableOutlined />}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Quick Actions */}
      <Row gutter={16}>
        <Col span={8}>
          <Card 
            style={{ 
              background: darkMode ? '#1a1a2e' : '#ffffff',
              border: `2px solid ${darkMode ? '#2d2d4d' : '#e2e8f0'}`,
              borderRadius: 16,
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            hoverable
            onClick={() => setActiveTab('batch')}
          >
            <div style={{ textAlign: 'center', padding: 20 }}>
              <UploadOutlined style={{ fontSize: 32, color: '#7c3aed', marginBottom: 16 }} />
              <Title level={4} style={{ margin: '8px 0' }}>Batch Upload</Title>
              <Text type="secondary">Process CSV files with multiple records</Text>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card 
            style={{ 
              background: darkMode ? '#1a1a2e' : '#ffffff',
              border: `2px solid ${darkMode ? '#2d2d4d' : '#e2e8f0'}`,
              borderRadius: 16,
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            hoverable
            onClick={() => setActiveTab('single')}
          >
            <div style={{ textAlign: 'center', padding: 20 }}>
              <ThunderboltOutlined style={{ fontSize: 32, color: '#ec4899', marginBottom: 16 }} />
              <Title level={4} style={{ margin: '8px 0' }}>Single Test</Title>
              <Text type="secondary">Get instant AI recommendations</Text>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card 
            style={{ 
              background: darkMode ? '#1a1a2e' : '#ffffff',
              border: `2px solid ${darkMode ? '#2d2d4d' : '#e2e8f0'}`,
              borderRadius: 16,
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            hoverable
            onClick={checkHealth}
          >
            <div style={{ textAlign: 'center', padding: 20 }}>
              <RocketOutlined style={{ fontSize: 32, color: '#10b981', marginBottom: 16 }} />
              <Title level={4} style={{ margin: '8px 0' }}>System Health</Title>
              <Text type="secondary">Check API and model status</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      {rows.length > 0 && (
        <Card
          title="📊 Recent Optimizations"
          style={{ 
            background: darkMode ? '#1a1a2e' : '#ffffff',
            border: `1px solid ${darkMode ? '#2d2d4d' : '#e2e8f0'}`,
            borderRadius: 16,
          }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#2d2d4d' : '#f0f0f0'} />
                  <XAxis dataKey="name" stroke={darkMode ? '#ffffff' : '#000000'} />
                  <YAxis stroke={darkMode ? '#ffffff' : '#000000'} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      background: darkMode ? '#1a1a2e' : 'white',
                      border: `1px solid ${darkMode ? '#2d2d4d' : '#e2e8f0'}`,
                      borderRadius: 8,
                      color: darkMode ? '#ffffff' : '#000000'
                    }}
                  />
                  <Area type="monotone" dataKey="price" stroke="#7c3aed" fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </Col>
            <Col span={12}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#2d2d4d' : '#f0f0f0'} />
                  <XAxis dataKey="name" stroke={darkMode ? '#ffffff' : '#000000'} />
                  <YAxis stroke={darkMode ? '#ffffff' : '#000000'} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      background: darkMode ? '#1a1a2e' : 'white',
                      border: `1px solid ${darkMode ? '#2d2d4d' : '#e2e8f0'}`,
                      borderRadius: 8,
                      color: darkMode ? '#ffffff' : '#000000'
                    }}
                  />
                  <Bar dataKey="completion" fill="#ec4899" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Col>
          </Row>
        </Card>
      )}
    </Space>
  );

  const renderBatchProcessing = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card
        title={
          <span>
            <UploadOutlined style={{ color: '#7c3aed', marginRight: 8 }} />
            Batch CSV Processing
          </span>
        }
        style={{ 
          background: darkMode ? '#1a1a2e' : '#ffffff',
          border: `1px solid ${darkMode ? '#2d2d4d' : '#e2e8f0'}`,
          borderRadius: 16,
        }}
      >
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Upload 
            beforeUpload={onUpload} 
            maxCount={1} 
            accept=".csv" 
            showUploadList={false}
          >
            <Button 
              type="primary" 
              size="large"
              loading={loading}
              style={{ 
                height: 60, 
                padding: '0 40px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                border: 'none',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600
              }}
              icon={<UploadOutlined />}
            >
              {loading ? 'Processing...' : 'Upload CSV File'}
            </Button>
          </Upload>
          <Text type="secondary" style={{ display: 'block', marginTop: 16 }}>
            Upload your dynamic_pricing.csv file for AI optimization
          </Text>
        </div>

        {serverError && (
          <Alert 
            style={{ marginTop: 16 }} 
            type="error" 
            message="Processing Error"
            description={serverError}
            showIcon
          />
        )}
      </Card>

      {kpis && (
        <Card
          title="📈 Performance Metrics"
          style={{ 
            background: darkMode ? '#1a1a2e' : '#ffffff',
            border: `1px solid ${darkMode ? '#2d2d4d' : '#e2e8f0'}`,
            borderRadius: 16,
          }}
        >
          <Row gutter={[16, 16]}>
            {Object.entries(kpis).map(([k, v]) => (
              <Col span={6} key={k}>
                <Card 
                  size="small"
                  style={{ 
                    background: darkMode ? '#2d2d4d' : '#f8fafc',
                    border: `1px solid ${darkMode ? '#3730a3' : '#e2e8f0'}`,
                    textAlign: 'center'
                  }}
                >
                  <Statistic 
                    title={k} 
                    value={v}
                    valueStyle={{ 
                      color: k.includes('Lift') || k.includes('Margin') || k.includes('Conversion') ? 
                             (v > 0 ? '#10b981' : v < 0 ? '#ef4444' : '#f59e0b') : '#7c3aed',
                      fontSize: 20
                    }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {rows.length > 0 && (
        <Card
          title="📋 Optimization Results"
          style={{ 
            background: darkMode ? '#1a1a2e' : '#ffffff',
            border: `1px solid ${darkMode ? '#2d2d4d' : '#e2e8f0'}`,
            borderRadius: 16,
          }}
        >
          <Table
            columns={columns}
            dataSource={rows}
            rowKey={(r) => r.index ?? JSON.stringify(r)}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
            style={{
              background: darkMode ? '#1a1a2e' : 'white',
            }}
          />
        </Card>
      )}
    </Space>
  );

  const renderSingleTest = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card
        title={
          <span>
            <ThunderboltOutlined style={{ color: '#ec4899', marginRight: 8 }} />
            AI Single Recommendation
          </span>
        }
        style={{ 
          background: darkMode ? '#1a1a2e' : '#ffffff',
          border: `1px solid ${darkMode ? '#2d2d4d' : '#e2e8f0'}`,
          borderRadius: 16,
        }}
      >
        <Row gutter={24}>
          <Col span={16}>
            <div style={{ 
              background: darkMode ? '#1a1a2e' : '#ffffff',
              padding: 24,
              borderRadius: 12,
              border: `1px solid ${darkMode ? '#2d2d4d' : '#e2e8f0'}`
            }}>
              <Title level={4} style={{ color: darkMode ? '#ffffff' : '#1e293b', marginBottom: 24 }}>
                📊 Enter Ride Details
              </Title>
              
              <Row gutter={16}>
                {/* Column 1 */}
                <Col span={12}>
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {/* Historical Cost */}
                    <div>
                      <Text strong style={{ color: darkMode ? '#ffffff' : '#1e293b', display: 'block', marginBottom: 8 }}>
                        💰 Historical Cost of Ride (₹)
                      </Text>
                      <Input
                        type="number"
                        value={formData.Historical_Cost_of_Ride}
                        onChange={(e) => handleInputChange('Historical_Cost_of_Ride', parseInt(e.target.value) || 0)}
                        style={{ 
                          width: '100%',
                          background: darkMode ? '#1a1a2e' : '#ffffff',
                          border: `2px solid ${darkMode ? '#2d2d4d' : '#e2e8f0'}`,
                          borderRadius: 8,
                          color: darkMode ? '#ffffff' : '#000000'
                        }}
                        size="large"
                      />
                    </div>

                    {/* Expected Ride Duration */}
                    <div>
                      <Text strong style={{ color: darkMode ? '#ffffff' : '#1e293b', display: 'block', marginBottom: 8 }}>
                        ⏱️ Expected Ride Duration (min)
                      </Text>
                      <Input
                        type="number"
                        value={formData.Expected_Ride_Duration}
                        onChange={(e) => handleInputChange('Expected_Ride_Duration', parseInt(e.target.value) || 0)}
                        style={{ 
                          width: '100%',
                          background: darkMode ? '#1a1a2e' : '#ffffff',
                          border: `2px solid ${darkMode ? '#2d2d4d' : '#e2e8f0'}`,
                          borderRadius: 8,
                          color: darkMode ? '#ffffff' : '#000000'
                        }}
                        size="large"
                      />
                    </div>

                    {/* Number of Riders */}
                    <div>
                      <Text strong style={{ color: darkMode ? '#ffffff' : '#1e293b', display: 'block', marginBottom: 8 }}>
                        👥 Number of Riders
                      </Text>
                      <Input
                        type="number"
                        value={formData.Number_of_Riders}
                        onChange={(e) => handleInputChange('Number_of_Riders', parseInt(e.target.value) || 0)}
                        style={{ 
                          width: '100%',
                          background: darkMode ? '#1a1a2e' : '#ffffff',
                          border: `2px solid ${darkMode ? '#2d2d4d' : '#e2e8f0'}`,
                          borderRadius: 8,
                          color: darkMode ? '#ffffff' : '#000000'
                        }}
                        size="large"
                      />
                    </div>

                    {/* Number of Drivers */}
                    <div>
                      <Text strong style={{ color: darkMode ? '#ffffff' : '#1e293b', display: 'block', marginBottom: 8 }}>
                        🚗 Number of Drivers
                      </Text>
                      <Input
                        type="number"
                        value={formData.Number_of_Drivers}
                        onChange={(e) => handleInputChange('Number_of_Drivers', parseInt(e.target.value) || 0)}
                        style={{ 
                          width: '100%',
                          background: darkMode ? '#1a1a2e' : '#ffffff',
                          border: `2px solid ${darkMode ? '#2d2d4d' : '#e2e8f0'}`,
                          borderRadius: 8,
                          color: darkMode ? '#ffffff' : '#000000'
                        }}
                        size="large"
                      />
                    </div>

                    {/* Competitor Price */}
                    <div>
                      <Text strong style={{ color: darkMode ? '#ffffff' : '#1e293b', display: 'block', marginBottom: 8 }}>
                        💸 Competitor Price (₹)
                      </Text>
                      <Input
                        type="number"
                        value={formData.competitor_price}
                        onChange={(e) => handleInputChange('competitor_price', parseInt(e.target.value) || 0)}
                        style={{ 
                          width: '100%',
                          background: darkMode ? '#1a1a2e' : '#ffffff',
                          border: `2px solid ${darkMode ? '#2d2d4d' : '#e2e8f0'}`,
                          borderRadius: 8,
                          color: darkMode ? '#ffffff' : '#000000'
                        }}
                        size="large"
                      />
                    </div>
                  </Space>
                </Col>

                {/* Column 2 */}
                <Col span={12}>
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {/* Vehicle Type */}
                    <div>
                      <Text strong style={{ color: darkMode ? '#ffffff' : '#1e293b', display: 'block', marginBottom: 8 }}>
                        🚘 Vehicle Type
                      </Text>
                      <select
                        value={formData.Vehicle_Type}
                        onChange={(e) => handleInputChange('Vehicle_Type', e.target.value)}
                        style={{ 
                          width: '100%',
                          padding: '8px 12px',
                          background: darkMode ? '#1a1a2e' : '#ffffff',
                          border: `2px solid ${darkMode ? '#2d2d4d' : '#e2e8f0'}`,
                          borderRadius: 8,
                          color: darkMode ? '#ffffff' : '#000000',
                          fontSize: '14px'
                        }}
                      >
                        <option value="Economy">Economy</option>
                        <option value="Premium">Premium</option>
                      </select>
                    </div>

                    {/* Time of Booking */}
                    <div>
                      <Text strong style={{ color: darkMode ? '#ffffff' : '#1e293b', display: 'block', marginBottom: 8 }}>
                        🕒 Time of Booking
                      </Text>
                      <select
                        value={formData.Time_of_Booking}
                        onChange={(e) => handleInputChange('Time_of_Booking', e.target.value)}
                        style={{ 
                          width: '100%',
                          padding: '8px 12px',
                          background: darkMode ? '#1a1a2e' : '#ffffff',
                          border: `2px solid ${darkMode ? '#2d2d4d' : '#e2e8f0'}`,
                          borderRadius: 8,
                          color: darkMode ? '#ffffff' : '#000000',
                          fontSize: '14px'
                        }}
                      >
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="Evening">Evening</option>
                        <option value="Night">Night</option>
                      </select>
                    </div>

                    {/* Location Category */}
                    <div>
                      <Text strong style={{ color: darkMode ? '#ffffff' : '#1e293b', display: 'block', marginBottom: 8 }}>
                        📍 Location Category
                      </Text>
                      <select
                        value={formData.Location_Category}
                        onChange={(e) => handleInputChange('Location_Category', e.target.value)}
                        style={{ 
                          width: '100%',
                          padding: '8px 12px',
                          background: darkMode ? '#1a1a2e' : '#ffffff',
                          border: `2px solid ${darkMode ? '#2d2d4d' : '#e2e8f0'}`,
                          borderRadius: 8,
                          color: darkMode ? '#ffffff' : '#000000',
                          fontSize: '14px'
                        }}
                      >
                        <option value="Urban">Urban</option>
                        <option value="Suburban">Suburban</option>
                        <option value="Rural">Rural</option>
                      </select>
                    </div>

                    {/* Customer Loyalty Status */}
                    <div>
                      <Text strong style={{ color: darkMode ? '#ffffff' : '#1e293b', display: 'block', marginBottom: 8 }}>
                        👑 Customer Loyalty Status
                      </Text>
                      <select
                        value={formData.Customer_Loyalty_Status}
                        onChange={(e) => handleInputChange('Customer_Loyalty_Status', e.target.value)}
                        style={{ 
                          width: '100%',
                          padding: '8px 12px',
                          background: darkMode ? '#1a1a2e' : '#ffffff',
                          border: `2px solid ${darkMode ? '#2d2d4d' : '#e2e8f0'}`,
                          borderRadius: 8,
                          color: darkMode ? '#ffffff' : '#000000',
                          fontSize: '14px'
                        }}
                      >
                        <option value="Regular">Regular</option>
                        <option value="Silver">Silver</option>
                        <option value="Gold">Gold</option>
                      </select>
                    </div>

                    {/* Quick Presets */}
                    <div>
                      <Text strong style={{ color: darkMode ? '#ffffff' : '#1e293b', display: 'block', marginBottom: 12 }}>
                        ⚡ Quick Presets
                      </Text>
                      <Space wrap>
                        <Button 
                          size="small"
                          onClick={() => setFormData({
                            Historical_Cost_of_Ride: 180,
                            Expected_Ride_Duration: 25,
                            Number_of_Riders: 80,
                            Number_of_Drivers: 60,
                            Vehicle_Type: 'Economy',
                            Time_of_Booking: 'Morning',
                            Location_Category: 'Suburban',
                            Customer_Loyalty_Status: 'Regular',
                            competitor_price: 200
                          })}
                        >
                          Short Economy Ride
                        </Button>
                        <Button 
                          size="small"
                          onClick={() => setFormData({
                            Historical_Cost_of_Ride: 350,
                            Expected_Ride_Duration: 45,
                            Number_of_Riders: 200,
                            Number_of_Drivers: 80,
                            Vehicle_Type: 'Premium',
                            Time_of_Booking: 'Evening',
                            Location_Category: 'Urban',
                            Customer_Loyalty_Status: 'Gold',
                            competitor_price: 400
                          })}
                        >
                          Premium Peak Ride
                        </Button>
                      </Space>
                    </div>
                  </Space>
                </Col>
              </Row>

              {serverError && (
                <Alert 
                  style={{ marginTop: 16 }} 
                  type="error" 
                  message="API Error"
                  description={serverError}
                  showIcon
                />
              )}
            </div>
          </Col>
          
          <Col span={8}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Button
                type="primary"
                onClick={handleTestSingle}
                loading={loading}
                style={{ 
                  width: '100%', 
                  height: 60,
                  background: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                }}
                size="large"
                icon={<ThunderboltOutlined />}
              >
                Get AI Recommendation
              </Button>

              {/* Current Values Preview */}
              <Card 
                size="small"
                style={{ 
                  background: darkMode ? '#1a1a2e' : '#ffffff',
                  border: `1px solid ${darkMode ? '#2d2d4d' : '#e2e8f0'}`,
                }}
                title="📋 Current Values"
              >
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  {Object.entries(formData).map(([key, value]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <Text type="secondary">{key}:</Text>
                      <Text strong>{value}</Text>
                    </div>
                  ))}
                </Space>
              </Card>

              {singleResponse && (
                <Card 
                  style={{ 
                    background: darkMode ? '#1e1b4b' : '#f5f3ff',
                    border: `2px solid ${darkMode ? '#3730a3' : '#7c3aed'}`,
                    borderRadius: 12,
                  }}
                  title={
                    <span style={{ color: '#7c3aed' }}>
                      <CrownOutlined style={{ marginRight: 8 }} />
                      AI Recommendation
                    </span>
                  }
                >
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <div style={{ textAlign: 'center' }}>
                      <Text strong style={{ display: 'block', marginBottom: 4 }}>💰 Recommended Price</Text>
                      <Text style={{ color: '#10b981', fontSize: 24, fontWeight: 'bold' }}>
                        ₹{singleResponse.price_recommended}
                      </Text>
                    </div>
                    
                    <Divider style={{ margin: '12px 0' }} />
                    
                    <div>
                      <Text strong>🎯 Completion Probability</Text>
                      <Progress 
                        percent={Math.round(singleResponse.p_complete_recommended * 100)} 
                        strokeColor={{
                          '0%': '#7c3aed',
                          '100%': '#ec4899',
                        }}
                        format={percent => `${percent}%`}
                        style={{ marginTop: 8 }}
                      />
                    </div>
                    
                    <div>
                      <Text strong>📈 Gross Margin</Text>
                      <div style={{ marginTop: 8 }}>
                        <Badge 
                          count={`${singleResponse.gm_pct}%`} 
                          style={{ 
                            backgroundColor: singleResponse.gm_pct > 20 ? '#10b981' : 
                                           singleResponse.gm_pct > 10 ? '#f59e0b' : '#ef4444',
                            fontWeight: 'bold',
                            fontSize: 14
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Text strong>⚡ Price Range</Text>
                      <div style={{ marginTop: 8 }}>
                        <Text code style={{ color: '#7c3aed', fontSize: 14 }}>
                          ₹{singleResponse.bounds?.low} - ₹{singleResponse.bounds?.high}
                        </Text>
                      </div>
                    </div>
                  </Space>
                </Card>
              )}
            </div>
          </Col>
        </Row>
      </Card>
    </Space>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'batch':
        return renderBatchProcessing();
      case 'single':
        return renderSingleTest();
      default:
        return renderDashboard();
    }
  };

  return (
    <ConfigProvider theme={darkMode ? darkTheme : lightTheme}>
      <Layout style={{ minHeight: '100vh', background: darkMode ? '#0f0f23' : '#f8fafc' }}>
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={setCollapsed}
          style={{ 
            background: darkMode ? '#1a1a2e' : '#ffffff',
            borderRight: `1px solid ${darkMode ? '#2d2d4d' : '#e2e8f0'}`
          }}
        >
          <div style={{ padding: 16, textAlign: 'center', borderBottom: `1px solid ${darkMode ? '#2d2d4d' : '#e2e8f0'}` }}>
            <RocketOutlined style={{ fontSize: 24, color: '#7c3aed' }} />
            {!collapsed && (
              <Title level={4} style={{ color: darkMode ? '#ffffff' : '#1e293b', margin: '8px 0 0 0' }}>
                PriceAI
              </Title>
            )}
          </div>
          
          <div style={{ padding: '16px 0' }}>
            {menuItems.map(item => (
              <div
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                style={{
                  padding: '12px 24px',
                  margin: '4px 8px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: activeTab === item.key 
                    ? (darkMode ? '#3730a3' : '#7c3aed') 
                    : 'transparent',
                  color: activeTab === item.key ? 'white' : (darkMode ? '#ffffff' : '#1e293b'),
                  transition: 'all 0.3s',
                }}
              >
                {item.icon}
                {!collapsed && <span style={{ marginLeft: 12 }}>{item.label}</span>}
              </div>
            ))}
          </div>
        </Sider>

        <Layout>
          <Header style={{ 
            background: darkMode ? '#1a1a2e' : '#ffffff',
            borderBottom: `1px solid ${darkMode ? '#2d2d4d' : '#e2e8f0'}`,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Title level={3} style={{ color: darkMode ? '#ffffff' : '#1e293b', margin: 0 }}>
              {activeTab === 'dashboard' && '🚀 AI Pricing Dashboard'}
              {activeTab === 'batch' && '📁 Batch Processing'}
              {activeTab === 'single' && '⚡ Single Recommendation'}
            </Title>
            
            <Space>
              <Tooltip title={`Switch to ${darkMode ? 'Light' : 'Dark'} Mode`}>
                <Button 
                  icon={<BulbOutlined />} 
                  onClick={toggleTheme}
                  style={{ 
                    background: darkMode ? '#3730a3' : '#7c3aed',
                    border: 'none',
                    color: 'white'
                  }}
                >
                  {darkMode ? 'Light' : 'Dark'}
                </Button>
              </Tooltip>
              
              <Tooltip title="Check System Health">
                <Button 
                  icon={<ReloadOutlined />} 
                  loading={healthLoading}
                  onClick={checkHealth}
                  style={{ 
                    background: health?.ok ? '#10b981' : '#ef4444',
                    border: 'none',
                    color: 'white'
                  }}
                >
                  {health?.ok ? 'Connected' : 'Check Health'}
                </Button>
              </Tooltip>
            </Space>
          </Header>

          <Content style={{ padding: 24, margin: 0, minHeight: 280 }}>
            {renderContent()}
          </Content>

          <Footer style={{ 
            textAlign: 'center', 
            background: darkMode ? '#1a1a2e' : '#ffffff',
            color: darkMode ? '#ffffff' : '#1e293b',
            borderTop: `1px solid ${darkMode ? '#2d2d4d' : '#e2e8f0'}`
          }}>
            <Space direction="vertical" size="small">
              <Text strong>🚀 PriceAI • Dynamic Pricing Intelligence</Text>
              <Text type="secondary">
                Powered by Machine Learning • © {new Date().getFullYear()}
              </Text>
            </Space>
          </Footer>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default App;