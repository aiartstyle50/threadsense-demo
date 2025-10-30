import React, { useState, useMemo } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Users, Clock, CheckCircle, AlertTriangle, Activity, Upload, Eye, X, Lightbulb, Target, BarChart3, Bot, ListChecks, Sparkles } from 'lucide-react';

// Use cases for each task
const taskUseCases = {
  'draft_customer_email': [
    { title: 'Follow-up after demo', description: 'Send personalized follow-up emails after product demonstrations', frequency: 'Daily', avgTime: '15 min' },
    { title: 'Cold outreach to prospects', description: 'Initial contact with potential customers in target industries', frequency: 'Daily', avgTime: '20 min' },
    { title: 'Re-engagement campaigns', description: 'Reach out to inactive leads or dormant accounts', frequency: 'Weekly', avgTime: '18 min' },
    { title: 'Response to pricing inquiries', description: 'Answer questions about pricing and package options', frequency: 'Daily', avgTime: '12 min' },
    { title: 'Proposal delivery emails', description: 'Send formal proposals with customized messaging', frequency: 'Weekly', avgTime: '22 min' }
  ],
  'fix_bug_production': [
    { title: 'Database connection timeout', description: 'Diagnose and fix connection pool exhaustion issues', frequency: 'Weekly', avgTime: '45 min' },
    { title: 'Memory leak investigation', description: 'Identify and resolve memory leaks in production services', frequency: 'Monthly', avgTime: '90 min' },
    { title: 'API response errors', description: 'Debug and fix 500 errors in REST endpoints', frequency: 'Daily', avgTime: '35 min' },
    { title: 'Race condition fixes', description: 'Resolve concurrency issues causing data corruption', frequency: 'Weekly', avgTime: '60 min' },
    { title: 'Frontend rendering bugs', description: 'Fix UI components not rendering correctly', frequency: 'Daily', avgTime: '30 min' }
  ],
  'summarize_weekly_metrics': [
    { title: 'Executive dashboard summary', description: 'Create weekly KPI summaries for leadership team', frequency: 'Weekly', avgTime: '25 min' },
    { title: 'Team performance reports', description: 'Summarize individual and team metrics for managers', frequency: 'Weekly', avgTime: '20 min' },
    { title: 'Customer health scores', description: 'Aggregate and summarize customer engagement metrics', frequency: 'Weekly', avgTime: '18 min' },
    { title: 'Sales pipeline analysis', description: 'Summarize deal flow and conversion metrics', frequency: 'Weekly', avgTime: '22 min' },
    { title: 'Product usage trends', description: 'Analyze and summarize feature adoption patterns', frequency: 'Weekly', avgTime: '28 min' }
  ],
  'write_sql_query': [
    { title: 'Customer segmentation analysis', description: 'Query user data to create behavioral segments', frequency: 'Daily', avgTime: '20 min' },
    { title: 'Revenue attribution reports', description: 'Complex joins to attribute revenue to marketing channels', frequency: 'Weekly', avgTime: '35 min' },
    { title: 'Product usage analytics', description: 'Query event data to analyze feature usage patterns', frequency: 'Daily', avgTime: '25 min' },
    { title: 'Data quality checks', description: 'Write queries to validate data integrity and completeness', frequency: 'Daily', avgTime: '15 min' },
    { title: 'Performance optimization', description: 'Optimize slow queries with proper indexes and joins', frequency: 'Weekly', avgTime: '40 min' }
  ],
  'refactor_legacy_code': [
    { title: 'Extract reusable components', description: 'Refactor monolithic components into smaller, reusable pieces', frequency: 'Weekly', avgTime: '45 min' },
    { title: 'Update deprecated APIs', description: 'Replace deprecated library calls with modern equivalents', frequency: 'Weekly', avgTime: '30 min' },
    { title: 'Add type safety', description: 'Convert JavaScript to TypeScript for better type checking', frequency: 'Weekly', avgTime: '40 min' },
    { title: 'Improve error handling', description: 'Add proper try-catch blocks and error boundaries', frequency: 'Weekly', avgTime: '25 min' },
    { title: 'Simplify complex logic', description: 'Break down nested conditionals into clearer code', frequency: 'Daily', avgTime: '35 min' }
  ],
  'draft_product_spec': [
    { title: 'New feature specification', description: 'Document requirements for new product features', frequency: 'Weekly', avgTime: '60 min' },
    { title: 'API design documentation', description: 'Spec out API endpoints, request/response formats', frequency: 'Weekly', avgTime: '45 min' },
    { title: 'User flow documentation', description: 'Document user journeys and interaction patterns', frequency: 'Weekly', avgTime: '50 min' },
    { title: 'Technical architecture docs', description: 'Specify system design and component interactions', frequency: 'Monthly', avgTime: '90 min' },
    { title: 'Integration specifications', description: 'Document third-party integration requirements', frequency: 'Monthly', avgTime: '55 min' }
  ],
  'analyze_support_tickets': [
    { title: 'Categorize incoming tickets', description: 'Classify tickets by issue type and urgency', frequency: 'Daily', avgTime: '15 min' },
    { title: 'Identify trending issues', description: 'Analyze patterns to spot emerging problems', frequency: 'Daily', avgTime: '25 min' },
    { title: 'Customer satisfaction analysis', description: 'Review CSAT scores and identify pain points', frequency: 'Weekly', avgTime: '30 min' },
    { title: 'Response time optimization', description: 'Analyze ticket resolution times and bottlenecks', frequency: 'Weekly', avgTime: '20 min' },
    { title: 'Knowledge base gap analysis', description: 'Identify common questions missing from docs', frequency: 'Monthly', avgTime: '45 min' }
  ],
  'generate_test_cases': [
    { title: 'Unit test generation', description: 'Create unit tests for new functions and methods', frequency: 'Daily', avgTime: '25 min' },
    { title: 'Edge case identification', description: 'Identify and test boundary conditions and edge cases', frequency: 'Daily', avgTime: '30 min' },
    { title: 'Integration test scenarios', description: 'Write tests for API endpoints and service interactions', frequency: 'Weekly', avgTime: '40 min' },
    { title: 'Regression test updates', description: 'Update test suites after bug fixes', frequency: 'Weekly', avgTime: '20 min' },
    { title: 'End-to-end test flows', description: 'Create comprehensive user journey tests', frequency: 'Weekly', avgTime: '50 min' }
  ]
};

// Process uploaded JSONL data
const processUploadedData = (sessions) => {
  if (!sessions || sessions.length === 0) {
    return null;
  }

  const deptCounts = {};
  const deptTime = {};
  const deptQuality = {};
  
  sessions.forEach(session => {
    const dept = session.domain || 'other';
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    deptTime[dept] = (deptTime[dept] || 0) + (session.time_saved_minutes || 0);
    if (session.quality_delta !== null) {
      if (!deptQuality[dept]) {
        deptQuality[dept] = { sum: 0, count: 0 };
      }
      deptQuality[dept].sum += session.quality_delta;
      deptQuality[dept].count += 1;
    }
  });

  const deptActivity = Object.keys(deptCounts).map(dept => ({
    dept,
    tasks: deptCounts[dept],
    timeSaved: deptTime[dept],
    users: Math.floor(deptCounts[dept] / 3) + 1,
    avgQuality: deptQuality[dept] ? deptQuality[dept].sum / deptQuality[dept].count : 0.7
  }));

  const modeCounts = {};
  const modeTime = {};
  sessions.forEach(session => {
    const mode = session.assist_mode || 'other';
    modeCounts[mode] = (modeCounts[mode] || 0) + 1;
    modeTime[mode] = (modeTime[mode] || 0) + (session.time_saved_minutes || 0);
  });

  const taskDist = Object.keys(modeCounts).map(mode => ({
    mode,
    count: modeCounts[mode],
    timeSaved: modeTime[mode]
  }));

  const taskCounts = {};
  const taskTime = {};
  const taskQuality = {};
  const taskDept = {};
  
  sessions.forEach(session => {
    const task = session.canonical_task || 'unknown';
    if (task !== 'null' && task !== 'unknown') {
      taskCounts[task] = (taskCounts[task] || 0) + 1;
      taskTime[task] = (taskTime[task] || 0) + (session.time_saved_minutes || 0);
      taskDept[task] = session.domain || 'other';
      if (session.quality_delta !== null) {
        if (!taskQuality[task]) {
          taskQuality[task] = { sum: 0, count: 0 };
        }
        taskQuality[task].sum += session.quality_delta;
        taskQuality[task].count += 1;
      }
    }
  });

  const topTasks = Object.keys(taskCounts)
    .map(task => ({
      task,
      dept: taskDept[task],
      count: taskCounts[task],
      avgTime: taskCounts[task] > 0 ? Math.round(taskTime[task] / taskCounts[task]) : 0,
      quality: taskQuality[task] ? taskQuality[task].sum / taskQuality[task].count : 0.7
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const outcomeCounts = {};
  sessions.forEach(session => {
    const outcome = session.outcome || 'unknown';
    outcomeCounts[outcome] = (outcomeCounts[outcome] || 0) + 1;
  });

  const outcomeData = Object.keys(outcomeCounts).map(outcome => ({
    outcome,
    count: outcomeCounts[outcome]
  }));

  const timeSeriesData = [];
  const weekBuckets = {};
  
  sessions.forEach((session, idx) => {
    const weekNum = Math.floor(idx / (sessions.length / 12));
    if (!weekBuckets[weekNum]) {
      weekBuckets[weekNum] = { timeSaved: 0, tasks: 0 };
    }
    weekBuckets[weekNum].timeSaved += session.time_saved_minutes || 0;
    weekBuckets[weekNum].tasks += 1;
  });

  let cumulative = 0;
  for (let i = 0; i < 12; i++) {
    const bucket = weekBuckets[i] || { timeSaved: 0, tasks: 0 };
    cumulative += bucket.timeSaved;
    const date = new Date();
    date.setDate(date.getDate() - ((11 - i) * 7));
    timeSeriesData.push({
      week: `Week ${i + 1}`,
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timeSaved: bucket.timeSaved,
      cumulative,
      tasks: bucket.tasks
    });
  }

  return { timeSeriesData, priorMonthData: [], deptActivity, taskDist, topTasks, outcomeData };
};

// Mock data generator
const generateMockData = () => {
  const departments = ['eng', 'sales', 'marketing', 'support', 'ops', 'data', 'finance', 'product'];
  const assistModes = ['coding', 'drafting', 'analysis', 'answering', 'editing', 'brainstorm'];
  const outcomes = ['used_in_work', 'experimental', 'discarded', 'needs_review'];
  
  const timeSeriesData = [];
  const priorMonthData = [];
  
  let cumulativeTime = 0;
  let priorCumulative = 0;
  
  // Generate prior month (weeks -12 to -1)
  for (let i = 23; i >= 12; i--) {
    const weekTime = Math.floor(600 + Math.random() * 300);
    priorCumulative += weekTime;
    const date = new Date();
    date.setDate(date.getDate() - (i * 7));
    priorMonthData.push({
      week: `Week ${24 - i}`,
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timeSaved: weekTime,
      priorTimeSaved: weekTime,
      cumulative: priorCumulative,
      tasks: Math.floor(25 + Math.random() * 15),
      chatgptTime: Math.floor(weekTime * 0.52),
      copilotTime: Math.floor(weekTime * 0.48),
      agentTime: 0
    });
  }
  
  // Generate current month (weeks 0 to 11)
  for (let i = 11; i >= 0; i--) {
    const weekNum = 11 - i;
    const weekTime = Math.floor(800 + Math.random() * 400 + weekNum * 150);
    cumulativeTime += weekTime;
    const date = new Date();
    date.setDate(date.getDate() - (i * 7));
    
    // ChatGPT: Growing steadily upward
    const chatgptBase = 400 + weekNum * 45;
    const chatgptTime = Math.floor(chatgptBase + Math.random() * 50);
    
    // Copilot: Declining over time
    const copilotBase = 500 - weekNum * 35;
    const copilotTime = Math.floor(copilotBase + Math.random() * 40);
    
    // Custom Agents: Low but exponential growth curve
    const agentBase = 10 * Math.pow(1.35, weekNum);
    const agentTime = Math.floor(agentBase + Math.random() * 5);
    
    timeSeriesData.push({
      week: `Week ${12 - i}`,
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timeSaved: weekTime,
      priorTimeSaved: priorMonthData[11 - i] ? priorMonthData[11 - i].timeSaved : 0,
      cumulative: cumulativeTime,
      tasks: Math.floor(30 + Math.random() * 25 + weekNum * 3),
      chatgptTime: chatgptTime,
      copilotTime: copilotTime,
      agentTime: agentTime
    });
  }

  const deptActivity = departments.map(dept => ({
    dept,
    tasks: Math.floor(Math.random() * 200 + 50),
    timeSaved: Math.floor(Math.random() * 3000 + 500),
    users: Math.floor(Math.random() * 25 + 5),
    avgQuality: 0.6 + Math.random() * 0.35
  }));

  const taskDist = assistModes.map(mode => ({
    mode,
    count: Math.floor(Math.random() * 300 + 100),
    timeSaved: Math.floor(Math.random() * 5000 + 1000)
  }));

  const topTasks = [
    { task: 'draft_customer_email', dept: 'sales', count: 156, avgTime: 18, quality: 0.85 },
    { task: 'fix_bug_production', dept: 'eng', count: 143, avgTime: 42, quality: 0.78 },
    { task: 'summarize_weekly_metrics', dept: 'data', count: 128, avgTime: 22, quality: 0.92 },
    { task: 'write_sql_query', dept: 'data', count: 119, avgTime: 25, quality: 0.81 },
    { task: 'refactor_legacy_code', dept: 'eng', count: 98, avgTime: 35, quality: 0.73 },
    { task: 'draft_product_spec', dept: 'product', count: 87, avgTime: 28, quality: 0.88 },
    { task: 'analyze_support_tickets', dept: 'support', count: 76, avgTime: 20, quality: 0.79 },
    { task: 'generate_test_cases', dept: 'eng', count: 71, avgTime: 30, quality: 0.82 }
  ];

  const outcomeData = outcomes.map(outcome => ({
    outcome,
    count: outcome === 'used_in_work' ? 650 : outcome === 'experimental' ? 180 : outcome === 'discarded' ? 85 : 42
  }));

  return { timeSeriesData, priorMonthData, deptActivity, taskDist, topTasks, outcomeData };
};

// Use Case Modal Component
const UseCaseModal = ({ task, onClose }) => {
  const useCases = taskUseCases[task] || [];
  const taskTitle = task.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{taskTitle}</h2>
            <p className="text-sm text-gray-600 mt-1">Common use cases and specific examples</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="space-y-4">
            {useCases.map((useCase, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{useCase.title}</h3>
                  <div className="flex gap-2">
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {useCase.frequency}
                    </span>
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      ~{useCase.avgTime}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Insight Card Component
const InsightCard = ({ type = 'insight', title, children, icon: Icon }) => {
  const styles = {
    insight: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900'
    },
    recommendation: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      textColor: 'text-green-900'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      textColor: 'text-amber-900'
    }
  };

  const style = styles[type] || styles.insight;
  const DefaultIcon = type === 'recommendation' ? Target : Lightbulb;
  const IconComponent = Icon || DefaultIcon;

  return (
    <div className={`${style.bg} border ${style.border} rounded-lg p-5 mb-6`}>
      <div className="flex items-start gap-4">
        <div className={`${style.iconBg} p-2 rounded-lg flex-shrink-0`}>
          <IconComponent className={`w-5 h-5 ${style.iconColor}`} />
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold ${style.textColor} mb-2`}>{title}</h3>
          <div className={`text-sm ${style.textColor} opacity-90`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const Threadsense = () => {
  const [activeTab, setActiveTab] = useState('executive');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [uploadedData, setUploadedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.trim().split('\n');
          const sessions = lines.map(line => JSON.parse(line));
          console.log('Loaded sessions:', sessions.length);
          
          const processed = processUploadedData(sessions);
          if (processed) {
            setUploadedData(processed);
            console.log('Data processed successfully');
          } else {
            alert('No valid data found in file');
          }
        } catch (error) {
          console.error('Error parsing file:', error);
          alert('Error parsing file. Please ensure it is a valid JSONL file.');
        } finally {
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        alert('Error reading file');
        setIsLoading(false);
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please ensure it is a valid JSONL file.');
      setIsLoading(false);
    }
  };

  const data = useMemo(() => {
    return uploadedData || generateMockData();
  }, [uploadedData]);

  const aiAgents = [
    { id: 1, name: 'Code Review Assistant', description: 'Analyzes pull requests and suggests improvements', platform: 'ChatGPT', department: 'Engineering', tasksCompleted: 342, timeSaved: 87, avgQuality: 0.89, successRate: 0.94 },
    { id: 2, name: 'Sales Email Generator', description: 'Creates personalized outreach emails', platform: 'Copilot', department: 'Sales', tasksCompleted: 298, timeSaved: 76, avgQuality: 0.92, successRate: 0.91 },
    { id: 3, name: 'Documentation Writer', description: 'Generates technical documentation from code', platform: 'ChatGPT', department: 'Engineering', tasksCompleted: 267, timeSaved: 68, avgQuality: 0.85, successRate: 0.88 },
    { id: 4, name: 'Meeting Summarizer', description: 'Creates action items from meeting transcripts', platform: 'Copilot', department: 'Ops', tasksCompleted: 189, timeSaved: 61, avgQuality: 0.88, successRate: 0.86 },
    { id: 5, name: 'Bug Analyzer', description: 'Diagnoses issues and suggests fixes', platform: 'ChatGPT', department: 'Engineering', tasksCompleted: 156, timeSaved: 94, avgQuality: 0.78, successRate: 0.82 },
    { id: 6, name: 'Proposal Generator', description: 'Creates sales proposals from templates', platform: 'Copilot', department: 'Sales', tasksCompleted: 134, timeSaved: 82, avgQuality: 0.87, successRate: 0.89 }
  ];

  const platformInfo = {
    'ChatGPT': {
      color: '#10b981',
      bgColor: '#d1fae5',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22.282 9.821a5.985 5.985 0 00-.516-4.91 6.046 6.046 0 00-6.51-2.9A6.065 6.065 0 004.981 4.18a5.985 5.985 0 00-3.998 2.9 6.046 6.046 0 00.743 7.097 5.98 5.98 0 00.51 4.911 6.051 6.051 0 006.515 2.9A5.985 5.985 0 0013.26 24a6.056 6.056 0 005.772-4.206 5.99 5.99 0 003.997-2.9 6.056 6.056 0 00-.747-7.073zM13.26 22.43a4.476 4.476 0 01-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 00.392-.681v-6.737l2.02 1.168a.071.071 0 01.038.052v5.583a4.504 4.504 0 01-4.494 4.494zM3.6 18.304a4.47 4.47 0 01-.535-3.014l.142.085 4.783 2.759a.771.771 0 00.78 0l5.843-3.369v2.332a.08.08 0 01-.033.062L9.74 19.95a4.5 4.5 0 01-6.14-1.646zM2.34 7.896a4.485 4.485 0 012.366-1.973V11.6a.766.766 0 00.388.676l5.815 3.355-2.02 1.168a.076.076 0 01-.071 0l-4.83-2.786A4.504 4.504 0 012.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 01.071 0l4.83 2.791a4.494 4.494 0 01-.676 8.105v-5.678a.79.79 0 00-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 00-.785 0L9.409 9.23V6.897a.066.066 0 01.028-.061l4.83-2.787a4.5 4.5 0 016.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 01-.038-.057V6.075a4.5 4.5 0 017.375-3.453l-.142.08L8.704 5.46a.795.795 0 00-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
        </svg>
      )
    },
    'Copilot': {
      color: '#3b82f6',
      bgColor: '#dbeafe',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M0 0h11.377v11.372H0zm12.623 0H24v11.372H12.623zM0 12.623h11.377V24H0zm12.623 0H24V24H12.623z"/>
        </svg>
      )
    }
  };

  const deptColors = {
    'Engineering': '#3b82f6',
    'Sales': '#10b981',
    'Support': '#8b5cf6',
    'Ops': '#f59e0b'
  };

  const filteredTimeSeriesData = useMemo(() => {
    if (platformFilter === 'all') return data.timeSeriesData;
    
    return data.timeSeriesData.map(week => {
      if (platformFilter === 'chatgpt') {
        return { ...week, timeSaved: week.chatgptTime, priorTimeSaved: week.priorTimeSaved * 0.52 };
      } else if (platformFilter === 'copilot') {
        return { ...week, timeSaved: week.copilotTime, priorTimeSaved: week.priorTimeSaved * 0.48 };
      } else if (platformFilter === 'agents') {
        return { ...week, timeSaved: week.agentTime, priorTimeSaved: 0 };
      }
      return week;
    });
  }, [data.timeSeriesData, platformFilter]);

  const totalTimeSaved = filteredTimeSeriesData.reduce((sum, d) => sum + d.timeSaved, 0);
  const priorMonthTotal = filteredTimeSeriesData.reduce((sum, d) => sum + (d.priorTimeSaved || 0), 0);
  const monthGrowth = priorMonthTotal > 0 ? (((totalTimeSaved - priorMonthTotal) / priorMonthTotal) * 100).toFixed(1) : 0;
  
  const lastWeekTime = filteredTimeSeriesData[filteredTimeSeriesData.length - 1].timeSaved;
  const prevWeekTime = filteredTimeSeriesData[filteredTimeSeriesData.length - 2].timeSaved;
  const timeGrowth = ((lastWeekTime - prevWeekTime) / prevWeekTime * 100).toFixed(1);

  const totalTasks = data.taskDist.reduce((sum, d) => sum + d.count, 0);
  const activeUsers = data.deptActivity.reduce((sum, d) => sum + d.users, 0);
  const avgQuality = (data.deptActivity.reduce((sum, d) => sum + d.avgQuality, 0) / data.deptActivity.length).toFixed(2);

  const usedInWork = data.outcomeData.find(o => o.outcome === 'used_in_work')?.count || 0;
  const totalOutcomes = data.outcomeData.reduce((sum, d) => sum + d.count, 0);
  const utilityRate = totalOutcomes > 0 ? ((usedInWork / totalOutcomes) * 100).toFixed(1) : 0;

  const agentTimeSaved = data.timeSeriesData.reduce((sum, d) => sum + (d.agentTime || 0), 0);

  const MetricCard = ({ title, value, subtitle, trend, icon: Icon, color = "blue" }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg`} style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center">
          {trend > 0 ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(trend)}% vs last week
          </span>
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'executive', label: 'Executive Summary', icon: Target },
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'agents', label: 'AI Agents', icon: Bot },
    { id: 'organization', label: 'My Organization', icon: Users },
    { id: 'tasks', label: 'Tasks & Usage', icon: ListChecks }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Threadsense</h1>
              <p className="text-lg text-gray-600">Executive overview of AI usage and impact across the organization</p>
            </div>
            <div className="relative">
              <input
                type="file"
                accept=".jsonl,.json"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={isLoading}
              />
              <label
                htmlFor="file-upload"
                className={`flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium cursor-pointer hover:bg-blue-700 transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="w-5 h-5" />
                {isLoading ? 'Processing...' : uploadedData ? 'Replace Data' : 'Upload Data'}
              </label>
            </div>
          </div>
          {uploadedData && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ Data loaded successfully! Showing metrics from uploaded sessions.
              </p>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'executive' && (
          <>
            {/* Alert Banner - Browser Agents */}
            <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500 rounded-lg p-4 shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Browser-Based AI Agents Gaining Significant Traction</h3>
                  <p className="text-sm text-gray-700">
                    Custom agents have grown <strong>340% this month</strong> and are now contributing{' '}
                    <strong>{(agentTimeSaved / 60).toFixed(0)} hours/month</strong> in time savings. This exponential adoption pattern 
                    suggests browser-based automation is becoming the preferred solution for repetitive workflows.{' '}
                    <span className="font-semibold text-purple-700">Consider expanding agent deployments to high-volume departments.</span>
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                    TRENDING
                  </span>
                </div>
              </div>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-8 h-8 opacity-80" />
                  <span className="text-xs font-semibold bg-white bg-opacity-20 px-2 py-1 rounded">THIS MONTH</span>
                </div>
                <p className="text-4xl font-bold mb-1">{(totalTimeSaved / 60).toFixed(0)}h</p>
                <p className="text-sm opacity-90">Total Time Saved</p>
                <div className="mt-3 pt-3 border-t border-white border-opacity-30">
                  <p className="text-xs">
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    +{monthGrowth}% vs prior month
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 opacity-80" />
                  <span className="text-xs font-semibold bg-white bg-opacity-20 px-2 py-1 rounded">ACTIVE</span>
                </div>
                <p className="text-4xl font-bold mb-1">{activeUsers}</p>
                <p className="text-sm opacity-90">AI Users</p>
                <div className="mt-3 pt-3 border-t border-white border-opacity-30">
                  <p className="text-xs">Across all departments</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-8 h-8 opacity-80" />
                  <span className="text-xs font-semibold bg-white bg-opacity-20 px-2 py-1 rounded">COMPLETED</span>
                </div>
                <p className="text-4xl font-bold mb-1">{totalTasks.toLocaleString()}</p>
                <p className="text-sm opacity-90">Tasks</p>
                <div className="mt-3 pt-3 border-t border-white border-opacity-30">
                  <p className="text-xs">{utilityRate}% used in work</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-8 h-8 opacity-80" />
                  <span className="text-xs font-semibold bg-white bg-opacity-20 px-2 py-1 rounded">QUALITY</span>
                </div>
                <p className="text-4xl font-bold mb-1">{(avgQuality * 100).toFixed(0)}%</p>
                <p className="text-sm opacity-90">Effectiveness</p>
                <div className="mt-3 pt-3 border-t border-white border-opacity-30">
                  <p className="text-xs">Utilization score</p>
                </div>
              </div>
            </div>

            {/* Time Saved Trend - All Platforms */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Time Saved Trend by Platform</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Tracking ChatGPT, Copilot, and Custom Agent contributions over the past 12 weeks
                </p>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={data.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} label={{ value: 'Minutes Saved', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="chatgptTime" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={{ fill: '#10b981', r: 4 }} 
                    name="ChatGPT" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="copilotTime" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    dot={{ fill: '#3b82f6', r: 4 }} 
                    name="Copilot" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="agentTime" 
                    stroke="#8b5cf6" 
                    strokeWidth={3} 
                    dot={{ fill: '#8b5cf6', r: 4 }} 
                    name="Custom Agents" 
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-gray-900">ChatGPT</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {data.timeSeriesData[data.timeSeriesData.length - 1].chatgptTime} min
                  </p>
                  <p className="text-xs text-gray-600 mt-1">This week • Trending up</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-gray-900">Copilot</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">
                    {data.timeSeriesData[data.timeSeriesData.length - 1].copilotTime} min
                  </p>
                  <p className="text-xs text-gray-600 mt-1">This week • Declining</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-gray-900">Custom Agents</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">
                    {data.timeSeriesData[data.timeSeriesData.length - 1].agentTime} min
                  </p>
                  <p className="text-xs text-gray-600 mt-1">This week • Exponential growth 🚀</p>
                </div>
              </div>
            </div>

            {/* Monthly Growth Analysis */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-8">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-2">Monthly Growth Analysis</h3>
                  <div className="text-sm text-blue-900 opacity-90">
                    <p>
                      AI adoption has accelerated with <strong>+{monthGrowth}% growth</strong> month-over-month, saving an additional{' '}
                      <strong>{((totalTimeSaved - priorMonthTotal) / 60).toFixed(0)} hours</strong>. Platform trends show a significant shift: 
                      ChatGPT usage is <strong>trending upward (+47%)</strong>, primarily driven by Engineering's code review workflows, while 
                      Copilot adoption is <strong>declining (-31%)</strong> as teams migrate to more specialized tools. Most notably, your 6 deployed 
                      custom agents are experiencing <strong>exponential growth (+340%)</strong>, now contributing{' '}
                      <strong>{(agentTimeSaved / 60).toFixed(0)} hours</strong> per month. This pattern suggests browser-based automation 
                      is becoming the preferred solution for repetitive, high-volume workflows. At current growth rates, custom agents could 
                      account for 25-30% of total time savings by Q2.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Takeaways */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Key Takeaways</h2>
                  <p className="text-sm text-gray-600">Critical insights for executive decision-making</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Growth & Adoption */}
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">Strong Growth Trajectory</h3>
                      <p className="text-sm text-gray-700">AI adoption is accelerating across the organization</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white bg-opacity-60 rounded p-3">
                      <p className="text-2xl font-bold text-green-700">+{monthGrowth}%</p>
                      <p className="text-xs text-gray-700">Month-over-month time saved increase</p>
                    </div>
                    <div className="bg-white bg-opacity-60 rounded p-3">
                      <p className="text-2xl font-bold text-green-700">{((totalTimeSaved - priorMonthTotal) / 60).toFixed(0)}h</p>
                      <p className="text-xs text-gray-700">Additional hours saved vs prior month</p>
                    </div>
                    <p className="text-xs text-gray-600 italic">
                      At current growth rate, projected to reach <strong>1,200+ hours/month</strong> by Q2
                    </p>
                  </div>
                </div>

                {/* Top Performers */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">Top 3 Use Cases</h3>
                      <p className="text-sm text-gray-700">Highest impact AI applications</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {data.topTasks.slice(0, 3).map((task, idx) => (
                      <div key={idx} className="bg-white bg-opacity-60 rounded p-3 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">{task.task.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-gray-600">{task.dept} • {task.count} tasks</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-700">{(task.quality * 100).toFixed(0)}%</p>
                          <p className="text-xs text-gray-600">quality</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Platform Distribution */}
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">Platform Trends</h3>
                      <p className="text-sm text-gray-700">12-week trajectory by platform</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white bg-opacity-60 rounded p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">ChatGPT</span>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-bold text-green-700">+47%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '58%' }}></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Steady upward growth</p>
                    </div>
                    <div className="bg-white bg-opacity-60 rounded p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Copilot</span>
                        <div className="flex items-center gap-2">
                          <TrendingDown className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-bold text-red-700">-31%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '31%' }}></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Declining adoption</p>
                    </div>
                    <div className="bg-white bg-opacity-60 rounded p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Custom Agents</span>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-bold text-purple-700">+340%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '11%' }}></div>
                      </div>
                      <p className="text-xs text-purple-700 mt-1 font-semibold">🚀 Exponential growth curve</p>
                    </div>
                  </div>
                </div>

                {/* Quality Insights */}
                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">Quality Patterns</h3>
                      <p className="text-sm text-gray-700">What drives effectiveness</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white bg-opacity-60 rounded p-3">
                      <p className="text-sm font-semibold text-gray-900 mb-1">High Performers (89-92%)</p>
                      <p className="text-xs text-gray-700">
                        ✓ Use specific prompt templates<br/>
                        ✓ Iterate 2-3 times before finalizing<br/>
                        ✓ Have peer review processes
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-60 rounded p-3">
                      <p className="text-sm font-semibold text-gray-900 mb-1">Lower Performers (73-78%)</p>
                      <p className="text-xs text-gray-700">
                        ✗ Accept first drafts<br/>
                        ✗ Lack quality checks<br/>
                        ✗ No systematic workflows
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Action Recommendation */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-5 mb-8">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-2">Strategic Action: Scale Your Top 3 Use Cases</h3>
                  <div className="text-sm text-green-900 opacity-90">
                    <p className="mb-2">
                      Based on current performance data, prioritize these three initiatives for maximum ROI:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><strong>Launch "AI Review Workshop"</strong> series: Have Engineering lead sessions for Product, Design, and QA teams on review 
                      workflows. Target: 30+ attendees, 20 hours/week potential savings.</li>
                      <li><strong>Deploy Email Templates</strong> from Sales to CS and Support: Create 10 pre-approved templates based on Sales' 
                      92%-effective emails. Target: 50+ hours/month across 35 team members.</li>
                      <li><strong>Establish Data-SQL Guild</strong>: Weekly office hours where Data team helps Finance and Ops adopt SQL assistance. 
                      Target: 25 hours/week savings within 45 days.</li>
                    </ul>
                    <p className="mt-2">
                      Combined impact: <strong>+100 hours/week</strong> by end of Q2, representing 40% increase in total AI-driven time savings.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Priorities */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Strategic Priorities</h2>
                  <p className="text-sm text-gray-600">Top 3 initiatives for maximum ROI in Q2</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {/* Priority 1 */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-bold text-green-700">1</span>
                    <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">HIGHEST ROI</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Scale Review Workflows</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Engineering's 89% effective code review process can be adapted for Product, Design, and QA teams.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-xs text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Launch "AI Review Workshop" series
                    </div>
                    <div className="flex items-center text-xs text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      30+ attendees across 3 departments
                    </div>
                    <div className="flex items-center text-xs text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Deploy within 3 weeks
                    </div>
                  </div>
                  <div className="bg-white rounded p-3 border border-green-200">
                    <p className="text-xs text-gray-600 mb-1">Expected Impact</p>
                    <p className="text-xl font-bold text-green-700">+20 hrs/week</p>
                  </div>
                </div>

                {/* Priority 2 */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-bold text-blue-700">2</span>
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">HIGH IMPACT</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Expand Email Templates</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Sales' 92% effective email generation can benefit CS and Support teams (35 people).
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-xs text-gray-700">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                      Create 10 pre-approved templates
                    </div>
                    <div className="flex items-center text-xs text-gray-700">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                      Train CS and Support teams
                    </div>
                    <div className="flex items-center text-xs text-gray-700">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                      Measure response rate lift
                    </div>
                  </div>
                  <div className="bg-white rounded p-3 border border-blue-200">
                    <p className="text-xs text-gray-600 mb-1">Expected Impact</p>
                    <p className="text-xl font-bold text-blue-700">+50 hrs/month</p>
                  </div>
                </div>

                {/* Priority 3 */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-bold text-purple-700">3</span>
                    <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">QUICK WIN</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Data-SQL Guild</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Data team's 87% SQL effectiveness can help Finance and Ops teams (20 people).
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-xs text-gray-700">
                      <CheckCircle className="w-4 h-4 text-purple-600 mr-2" />
                      Weekly SQL office hours
                    </div>
                    <div className="flex items-center text-xs text-gray-700">
                      <CheckCircle className="w-4 h-4 text-purple-600 mr-2" />
                      Share query templates library
                    </div>
                    <div className="flex items-center text-xs text-gray-700">
                      <CheckCircle className="w-4 h-4 text-purple-600 mr-2" />
                      45-day adoption timeline
                    </div>
                  </div>
                  <div className="bg-white rounded p-3 border border-purple-200">
                    <p className="text-xs text-gray-600 mb-1">Expected Impact</p>
                    <p className="text-xl font-bold text-purple-700">+25 hrs/week</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Combined Q2 Target</p>
                    <p className="text-2xl font-bold text-green-700">+100 hours/week</p>
                    <p className="text-xs text-gray-600 mt-1">Representing 40% increase in total AI-driven time savings by end of Q2</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Agent Builds */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">High-Impact Agent Opportunities</h2>
                  <p className="text-sm text-gray-600">Prioritized by ROI and strategic value</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Support Ticket Classifier */}
                <div className="border-2 border-purple-200 bg-purple-50 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">Support Ticket Classifier</h3>
                    <span className="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded">PRIORITY 1</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">
                    Automate ticket triage for 20 support agents, reducing classification time by 80%.
                  </p>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-white rounded p-2 text-center">
                      <p className="text-lg font-bold text-purple-700">32h/wk</p>
                      <p className="text-xs text-gray-600">Time saved</p>
                    </div>
                    <div className="bg-white rounded p-2 text-center">
                      <p className="text-lg font-bold text-purple-700">6 wks</p>
                      <p className="text-xs text-gray-600">ROI period</p>
                    </div>
                    <div className="bg-white rounded p-2 text-center">
                      <p className="text-lg font-bold text-purple-700">95%</p>
                      <p className="text-xs text-gray-600">Accuracy</p>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 transition">
                    View Full Details →
                  </button>
                </div>

                {/* Sales Call Summarizer */}
                <div className="border-2 border-green-200 bg-green-50 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">Sales Call Summarizer</h3>
                    <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">PRIORITY 2</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">
                    Automated summaries with CRM integration for 28 sales reps, 4 calls/day each.
                  </p>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-white rounded p-2 text-center">
                      <p className="text-lg font-bold text-green-700">56h/wk</p>
                      <p className="text-xs text-gray-600">Time saved</p>
                    </div>
                    <div className="bg-white rounded p-2 text-center">
                      <p className="text-lg font-bold text-green-700">8 wks</p>
                      <p className="text-xs text-gray-600">ROI period</p>
                    </div>
                    <div className="bg-white rounded p-2 text-center">
                      <p className="text-lg font-bold text-green-700">20min</p>
                      <p className="text-xs text-gray-600">Per call</p>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition">
                    View Full Details →
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'overview' && (
          <>
            {/* Time Saved Trend */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Time Saved Trend</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    This month: <span className="font-semibold text-green-600">+{monthGrowth}%</span> vs prior month
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPlatformFilter('all')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      platformFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Platforms
                  </button>
                  <button
                    onClick={() => setPlatformFilter('chatgpt')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      platformFilter === 'chatgpt' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ChatGPT
                  </button>
                  <button
                    onClick={() => setPlatformFilter('copilot')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      platformFilter === 'copilot' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Copilot
                  </button>
                  <button
                    onClick={() => setPlatformFilter('agents')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      platformFilter === 'agents' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Custom Agents
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={filteredTimeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="priorTimeSaved" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Prior Month" />
                  <Line type="monotone" dataKey="timeSaved" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} name="Current Month" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Hero Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <MetricCard
                title="Total Time Saved"
                value={`${(totalTimeSaved / 60).toFixed(0)}h`}
                subtitle={`${totalTimeSaved.toLocaleString()} minutes this month`}
                trend={parseFloat(timeGrowth)}
                icon={Clock}
                color="#10b981"
              />
              <MetricCard
                title="Active AI Users"
                value={activeUsers}
                subtitle="Across all departments"
                icon={Users}
                color="#3b82f6"
              />
              <MetricCard
                title="Tasks Completed"
                value={totalTasks.toLocaleString()}
                subtitle={`${utilityRate}% used in actual work`}
                icon={CheckCircle}
                color="#8b5cf6"
              />
              <MetricCard
                title="Utilization Quality"
                value={avgQuality}
                subtitle="How effectively teams use AI"
                icon={Activity}
                color="#f59e0b"
              />
            </div>

            {/* Platform Impact Summary */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Platform Impact Summary</h2>
              <div className="space-y-4">
                {/* ChatGPT */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.282 9.821a5.985 5.985 0 00-.516-4.91 6.046 6.046 0 00-6.51-2.9A6.065 6.065 0 004.981 4.18a5.985 5.985 0 00-3.998 2.9 6.046 6.046 0 00.743 7.097 5.98 5.98 0 00.51 4.911 6.051 6.051 0 006.515 2.9A5.985 5.985 0 0013.26 24a6.056 6.056 0 005.772-4.206 5.99 5.99 0 003.997-2.9 6.056 6.056 0 00-.747-7.073zM13.26 22.43a4.476 4.476 0 01-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 00.392-.681v-6.737l2.02 1.168a.071.071 0 01.038.052v5.583a4.504 4.504 0 01-4.494 4.494zM3.6 18.304a4.47 4.47 0 01-.535-3.014l.142.085 4.783 2.759a.771.771 0 00.78 0l5.843-3.369v2.332a.08.08 0 01-.033.062L9.74 19.95a4.5 4.5 0 01-6.14-1.646zM2.34 7.896a4.485 4.485 0 012.366-1.973V11.6a.766.766 0 00.388.676l5.815 3.355-2.02 1.168a.076.076 0 01-.071 0l-4.83-2.786A4.504 4.504 0 012.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 01.071 0l4.83 2.791a4.494 4.494 0 01-.676 8.105v-5.678a.79.79 0 00-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 00-.785 0L9.409 9.23V6.897a.066.066 0 01.028-.061l4.83-2.787a4.5 4.5 0 016.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 01-.038-.057V6.075a4.5 4.5 0 017.375-3.453l-.142.08L8.704 5.46a.795.795 0 00-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">ChatGPT</h3>
                        <p className="text-xs text-gray-500">OpenAI</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">487h</p>
                      <p className="text-xs text-gray-600">saved this month</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 border-t pt-2">
                    <span>Most used: <strong className="text-gray-900">Engineering</strong></span>
                    <span><strong className="text-gray-900">124</strong> active users</span>
                  </div>
                </div>
                
                {/* Microsoft Copilot */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M0 0h11.377v11.372H0zm12.623 0H24v11.372H12.623zM0 12.623h11.377V24H0zm12.623 0H24V24H12.623z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Microsoft Copilot</h3>
                        <p className="text-xs text-gray-500">Microsoft</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">342h</p>
                      <p className="text-xs text-gray-600">saved this month</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 border-t pt-2">
                    <span>Most used: <strong className="text-gray-900">Sales</strong></span>
                    <span><strong className="text-gray-900">87</strong> active users</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Activity Heatmap */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Department Activity Heatmap</h2>
              <div className="grid grid-cols-4 gap-4">
                {data.deptActivity.map(dept => {
                  const intensity = Math.min(dept.tasks / 200, 1);
                  return (
                    <div
                      key={dept.dept}
                      className="p-6 rounded-lg border-2 transition-all hover:scale-105 cursor-pointer"
                      style={{
                        backgroundColor: `rgba(59, 130, 246, ${intensity * 0.7 + 0.1})`,
                        borderColor: `rgba(59, 130, 246, ${intensity})`
                      }}
                    >
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700 uppercase mb-2">{dept.dept}</p>
                        <p className="text-2xl font-bold text-gray-900">{dept.tasks}</p>
                        <p className="text-xs text-gray-600 mt-1">tasks completed</p>
                        <p className="text-sm font-medium text-gray-700 mt-2">{dept.users} users</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Utilization Quality Insight */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-2">Utilization Quality: What Separates High from Low Performers</h3>
                  <div className="text-sm text-blue-900 opacity-90">
                    <p className="mb-2">
                      Analysis of your {avgQuality} average effectiveness shows clear patterns:
                    </p>
                    <p className="mb-2">
                      <strong>High performers (89-92% effectiveness):</strong> Sales Email Generator and Data's metric summarization achieve top scores. 
                      Common traits: teams use <strong>specific prompt templates</strong>, iterate on outputs 2-3 times before finalizing, and have 
                      established peer review processes for AI-generated content.
                    </p>
                    <p>
                      <strong>Lower performers (73-78%):</strong> Code refactoring tasks show room for improvement. Analysis indicates these teams 
                      accept first drafts without refinement and lack systematic quality checks. Recommendation: Implement the <strong>review workflow</strong> 
                      that Engineering uses for code reviews across all lower-performing use cases.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'agents' && (
          <>
            {/* Recommendation Alert */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 rounded-lg p-4 shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Recommendation: Deploy Documentation Writer for Project Management</h3>
                  <p className="text-sm text-gray-700">
                    Based on chat activity analysis, the <strong>Project Management team</strong> frequently discusses project charters, 
                    PRDs, and planning documents. The <strong>Documentation Writer agent</strong> (currently used by Engineering with 
                    85% effectiveness) could help them create structured project charters, status reports, and stakeholder updates. 
                    <span className="font-semibold text-blue-700"> Estimated impact: 12-15 hours/week saved across 8 PMs.</span>
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                    RECOMMENDED
                  </span>
                </div>
              </div>
            </div>

            {/* Top Performing AI Agents Table */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Top Performing AI Agents</h2>
                <p className="text-sm text-gray-600">Individual agent performance across platforms and departments</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Agent</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Platform</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Department</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Tasks</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Time Saved</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Effectiveness</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Success Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiAgents.map((agent) => (
                      <tr key={agent.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{agent.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{agent.description}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div 
                              className="p-1.5 rounded" 
                              style={{ 
                                backgroundColor: platformInfo[agent.platform].bgColor,
                                color: platformInfo[agent.platform].color
                              }}
                            >
                              {platformInfo[agent.platform].icon}
                            </div>
                            <span className="text-sm font-medium text-gray-700">{agent.platform}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span 
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: deptColors[agent.department] }}
                          >
                            {agent.department}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-sm font-semibold text-gray-900">{agent.tasksCompleted}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-sm font-semibold text-gray-900">{agent.timeSaved}h</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all"
                                style={{ width: `${agent.avgQuality * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-10 text-right">
                              {(agent.avgQuality * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            {(agent.successRate * 100).toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommended AI Agents */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Recommended AI Agents to Build</h2>
                <p className="text-sm text-gray-600">High-impact agent opportunities based on your usage patterns and department needs</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Support Ticket Classifier */}
                <div className="border-2 border-dashed border-purple-200 rounded-lg p-5 hover:border-purple-400 hover:bg-purple-50 transition-all">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900">Support Ticket Classifier</h3>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">Support</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        Your Support team handles 200+ tickets daily with 79% manual classification effectiveness. An automated classifier could reach 
                        95%+ accuracy while reducing triage time by 80%, based on similar implementations at comparable companies.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-purple-600" />
                          <span><strong>Est. time saved:</strong> 32 hours/week</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Users className="w-4 h-4 mr-2 text-purple-600" />
                          <span><strong>Would benefit:</strong> 20 support agents</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Activity className="w-4 h-4 mr-2 text-purple-600" />
                          <span><strong>Build effort:</strong> 2-3 weeks • ROI in 6 weeks</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-purple-200">
                    <button className="w-full py-2 px-4 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
                      View Implementation Plan
                    </button>
                  </div>
                </div>

                {/* Sales Call Summarizer */}
                <div className="border-2 border-dashed border-green-200 rounded-lg p-5 hover:border-green-400 hover:bg-green-50 transition-all">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900">Sales Call Summarizer</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">Sales</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        Given Sales' 92% effectiveness with email generation, a call summarizer would complement this strength. Your 28 reps average 
                        4 calls/day - automated summaries with CRM integration could save 20 minutes per call in note-taking and follow-up prep.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-green-600" />
                          <span><strong>Est. time saved:</strong> 56 hours/week</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Users className="w-4 h-4 mr-2 text-green-600" />
                          <span><strong>Would benefit:</strong> 28 sales reps</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Activity className="w-4 h-4 mr-2 text-green-600" />
                          <span><strong>Build effort:</strong> 4-6 weeks • ROI in 8 weeks</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-green-200">
                    <button className="w-full py-2 px-4 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                      View Implementation Plan
                    </button>
                  </div>
                </div>

                {/* Code Documentation Generator */}
                <div className="border-2 border-dashed border-blue-200 rounded-lg p-5 hover:border-blue-400 hover:bg-blue-50 transition-all">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900">Code Documentation Generator</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">Engineering</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        With Engineering's high 89% effectiveness on code reviews, documentation generation is a natural next step. Your 45 engineers 
                        currently spend ~2 hours/week on documentation. Automated generation could reduce this to 30 minutes while improving consistency.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-blue-600" />
                          <span><strong>Est. time saved:</strong> 68 hours/week</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Users className="w-4 h-4 mr-2 text-blue-600" />
                          <span><strong>Would benefit:</strong> 45 engineers</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Activity className="w-4 h-4 mr-2 text-blue-600" />
                          <span><strong>Build effort:</strong> 3-4 weeks • ROI in 4 weeks</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-blue-200">
                    <button className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                      View Implementation Plan
                    </button>
                  </div>
                </div>

                {/* Finance Report Generator */}
                <div className="border-2 border-dashed border-orange-200 rounded-lg p-5 hover:border-orange-400 hover:bg-orange-50 transition-all">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900">Finance Report Generator</h3>
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">Finance</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        Finance team currently has low AI adoption. Given Data team's 92% success with metric summarization, a similar agent for 
                        financial reports could dramatically accelerate monthly/quarterly close processes. Target: automate 70% of standard reports.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-orange-600" />
                          <span><strong>Est. time saved:</strong> 24 hours/week</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Users className="w-4 h-4 mr-2 text-orange-600" />
                          <span><strong>Would benefit:</strong> 8 finance analysts</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Activity className="w-4 h-4 mr-2 text-orange-600" />
                          <span><strong>Build effort:</strong> 3-5 weeks • ROI in 7 weeks</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-orange-200">
                    <button className="w-full py-2 px-4 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors">
                      View Implementation Plan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'organization' && (
          <>
            {/* Department Comparison Overview */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Department Performance Comparison</h2>
                  <p className="text-sm text-gray-600">AI adoption, effectiveness, and opportunity analysis across your organization</p>
                </div>
              </div>

              {/* Department Performance Table */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Department</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Active Users</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Tasks/Employee</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Time Saved/Employee</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Effectiveness</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.deptActivity.sort((a, b) => b.avgQuality - a.avgQuality).map((dept, idx) => {
                      const isTopPerformer = idx < 3;
                      const needsAttention = dept.avgQuality < 0.75;
                      const tasksPerEmployee = (dept.tasks / dept.users).toFixed(1);
                      const hoursPerEmployee = (dept.timeSaved / dept.users / 60).toFixed(1);
                      return (
                        <tr key={dept.dept} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900 uppercase">{dept.dept}</span>
                              {isTopPerformer && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                                  Top 3
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right text-sm text-gray-900">{dept.users}</td>
                          <td className="py-4 px-4 text-right text-sm font-semibold text-gray-900">{tasksPerEmployee}</td>
                          <td className="py-4 px-4 text-right text-sm font-semibold text-gray-900">{hoursPerEmployee}h</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${needsAttention ? 'bg-orange-500' : 'bg-green-500'}`}
                                  style={{ width: `${dept.avgQuality * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900 w-10 text-right">
                                {(dept.avgQuality * 100).toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            {needsAttention ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                                Needs Attention
                              </span>
                            ) : isTopPerformer ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                Excellent
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                On Track
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Per-Employee Performance Chart */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Per-Employee Performance Comparison</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart 
                    data={data.deptActivity.map(dept => ({
                      dept: dept.dept,
                      tasksPerEmployee: (dept.tasks / dept.users).toFixed(1),
                      hoursPerEmployee: (dept.timeSaved / dept.users / 60).toFixed(1)
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="dept" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis yAxisId="left" stroke="#3b82f6" style={{ fontSize: '12px' }} label={{ value: 'Tasks per Employee', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" style={{ fontSize: '12px' }} label={{ value: 'Hours per Employee', angle: 90, position: 'insideRight', style: { fontSize: '12px' } }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="tasksPerEmployee" fill="#3b82f6" name="Tasks per Employee" radius={[8, 8, 0, 0]} />
                    <Bar yAxisId="right" dataKey="hoursPerEmployee" fill="#10b981" name="Hours Saved per Employee" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top AI Uses by Department */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Top AI Uses by Department</h2>
                <p className="text-sm text-gray-600">Highlighting the most effective and impactful AI applications across teams</p>
              </div>
              
              <div className="space-y-6">
                {/* Engineering Success Story */}
                <div className="border-l-4 border-blue-500 bg-blue-50 rounded-lg p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900">Engineering: Code Review & Bug Fixing</h3>
                        <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">Top Performer</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        Your engineering team completed <strong>143 bug fixes</strong> and <strong>342 code reviews</strong> with AI assistance this month. 
                        ChatGPT's Code Review Assistant achieves an 89% effectiveness score - the highest across all agents. Engineers save an average of 
                        <strong> 42 minutes per bug fix</strong>, allowing the team to close issues 60% faster than Q4.
                      </p>
                      <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-blue-200">
                        <div>
                          <p className="text-xs text-gray-600">Monthly Impact</p>
                          <p className="text-lg font-bold text-blue-900">187h saved</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Team Adoption</p>
                          <p className="text-lg font-bold text-blue-900">87% active</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Effectiveness</p>
                          <p className="text-lg font-bold text-blue-900">89%</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-xs font-semibold text-blue-900 mb-1">💡 Opportunity to spread:</p>
                        <p className="text-xs text-gray-700">
                          Product and Design teams could adopt similar <strong>"Review Assistant"</strong> workflows for design critiques and 
                          spec reviews, potentially saving <strong>15-20 hours/week</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sales Success Story */}
                <div className="border-l-4 border-green-500 bg-green-50 rounded-lg p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900">Sales: Personalized Email Campaigns</h3>
                        <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">High ROI</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        Sales team generated <strong>156 personalized emails</strong> using Copilot this month, with an impressive 
                        92% effectiveness rating. The Email Generator agent saves <strong>18 minutes per email</strong>, and critically, 
                        emails with AI assistance show <strong>23% higher response rates</strong> than manually-written templates.
                      </p>
                      <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-green-200">
                        <div>
                          <p className="text-xs text-gray-600">Monthly Impact</p>
                          <p className="text-lg font-bold text-green-900">76h saved</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Response Lift</p>
                          <p className="text-lg font-bold text-green-900">+23%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Effectiveness</p>
                          <p className="text-lg font-bold text-green-900">92%</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <p className="text-xs font-semibold text-green-900 mb-1">💡 Opportunity to spread:</p>
                        <p className="text-xs text-gray-700">
                          Customer Success (15 team members) and Support (20 agents) could use this same email personalization approach 
                          for proactive outreach and follow-ups, targeting <strong>30+ hours/week</strong> in savings.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Team Success Story */}
                <div className="border-l-4 border-purple-500 bg-purple-50 rounded-lg p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900">Data: SQL & Analytics Assistance</h3>
                        <span className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">Fast Growing</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        Data team completed <strong>247 SQL queries and metric summaries</strong> with ChatGPT this month - up 40% from last month. 
                        The "summarize_weekly_metrics" task leads with a 92% effectiveness score, while SQL query generation saves 
                        <strong> 25 minutes per query</strong>. Query optimization suggestions have reduced average execution time by 35%.
                      </p>
                      <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-purple-200">
                        <div>
                          <p className="text-xs text-gray-600">Monthly Impact</p>
                          <p className="text-lg font-bold text-purple-900">68h saved</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Month Growth</p>
                          <p className="text-lg font-bold text-purple-900">+40%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Effectiveness</p>
                          <p className="text-lg font-bold text-purple-900">87%</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-purple-200">
                        <p className="text-xs font-semibold text-purple-900 mb-1">💡 Opportunity to spread:</p>
                        <p className="text-xs text-gray-700">
                          Finance (8 analysts) and Ops teams (12 members) regularly write SQL for reports. Extending this workflow 
                          could save an estimated <strong>25 hours/week</strong> across those departments.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actionable Insights by Department */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Actionable Insights by Department</h2>
                  <p className="text-sm text-gray-600">Specific recommendations to maximize AI impact in each team</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* Engineering Insight */}
                <div className="border-l-4 border-blue-500 bg-blue-50 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Engineering</h3>
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded mt-1">
                        High Performer • 89% Effectiveness
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-700">{(data.deptActivity.find(d => d.dept === 'eng')?.timeSaved / 60).toFixed(0)}h</p>
                      <p className="text-xs text-gray-600">saved this month</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Current strengths:</strong> Code reviews and bug fixing are most effective use cases (89% quality score).
                  </p>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-1">🎯 Recommended Action:</p>
                    <p className="text-xs text-gray-700">
                      Host "AI Code Review Workshop" for Product and Design teams. Your proven workflow can be adapted for design critiques 
                      and spec reviews. <strong>Potential impact: +20 hours/week across 3 departments.</strong>
                    </p>
                  </div>
                </div>

                {/* Sales Insight */}
                <div className="border-l-4 border-green-500 bg-green-50 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Sales</h3>
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded mt-1">
                        High Performer • 92% Effectiveness
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-700">{(data.deptActivity.find(d => d.dept === 'sales')?.timeSaved / 60).toFixed(0)}h</p>
                      <p className="text-xs text-gray-600">saved this month</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Current strengths:</strong> Email personalization achieves 92% effectiveness with 23% higher response rates.
                  </p>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="text-xs font-semibold text-green-900 mb-1">🎯 Recommended Action:</p>
                    <p className="text-xs text-gray-700">
                      Expand your email templates to Customer Success (15 people) and Support (20 agents) teams. 
                      Create 10 pre-approved templates for proactive outreach. <strong>Potential impact: +50 hours/month.</strong>
                    </p>
                  </div>
                </div>

                {/* Data Team Insight */}
                <div className="border-l-4 border-purple-500 bg-purple-50 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Data</h3>
                      <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded mt-1">
                        Growing Fast • 87% Effectiveness
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-700">{(data.deptActivity.find(d => d.dept === 'data')?.timeSaved / 60).toFixed(0)}h</p>
                      <p className="text-xs text-gray-600">saved this month</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Current strengths:</strong> SQL generation and metric summarization (92% on weekly reports).
                  </p>
                  <div className="bg-white rounded-lg p-3 border border-purple-200">
                    <p className="text-xs font-semibold text-purple-900 mb-1">🎯 Recommended Action:</p>
                    <p className="text-xs text-gray-700">
                      Launch "Data-SQL Guild" with weekly office hours for Finance and Ops teams. Share your query template library 
                      and best practices. <strong>Potential impact: +25 hours/week within 45 days.</strong>
                    </p>
                  </div>
                </div>

                {/* Support Insight */}
                <div className="border-l-4 border-orange-500 bg-orange-50 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Support</h3>
                      <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded mt-1">
                        Needs Attention • 73% Effectiveness
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-700">{(data.deptActivity.find(d => d.dept === 'support')?.timeSaved / 60).toFixed(0)}h</p>
                      <p className="text-xs text-gray-600">saved this month</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Gap identified:</strong> Ticket analysis tasks show lower effectiveness (73% vs 92% org average).
                  </p>
                  <div className="bg-white rounded-lg p-3 border border-orange-200">
                    <p className="text-xs font-semibold text-orange-900 mb-1">🎯 Recommended Action:</p>
                    <p className="text-xs text-gray-700">
                      Build automated "Support Ticket Classifier" agent. Based on benchmarks, this could achieve 95% accuracy while 
                      reducing triage time by 80%. <strong>ROI in 6 weeks • Saves 32 hours/week.</strong>
                    </p>
                  </div>
                </div>

                {/* Marketing Insight */}
                <div className="border-l-4 border-pink-500 bg-pink-50 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Marketing</h3>
                      <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded mt-1">
                        Moderate Adoption • 78% Effectiveness
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-pink-700">{(data.deptActivity.find(d => d.dept === 'marketing')?.timeSaved / 60).toFixed(0)}h</p>
                      <p className="text-xs text-gray-600">saved this month</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Opportunity:</strong> Content creation workflows could benefit from Sales' email personalization approach.
                  </p>
                  <div className="bg-white rounded-lg p-3 border border-pink-200">
                    <p className="text-xs font-semibold text-pink-900 mb-1">🎯 Recommended Action:</p>
                    <p className="text-xs text-gray-700">
                      Adopt Sales team's proven template-based approach for campaign copy and social content. Run joint training session 
                      with Sales. <strong>Potential impact: +15 hours/week with higher engagement rates.</strong>
                    </p>
                  </div>
                </div>

                {/* Finance Insight */}
                <div className="border-l-4 border-yellow-500 bg-yellow-50 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Finance</h3>
                      <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded mt-1">
                        Low Adoption • 68% Effectiveness
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-yellow-700">{(data.deptActivity.find(d => d.dept === 'finance')?.timeSaved / 60).toFixed(0)}h</p>
                      <p className="text-xs text-gray-600">saved this month</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Critical gap:</strong> Lowest AI adoption across organization. Missing out on proven workflows from Data team.
                  </p>
                  <div className="bg-white rounded-lg p-3 border border-yellow-200">
                    <p className="text-xs font-semibold text-yellow-900 mb-1">🎯 Recommended Action:</p>
                    <p className="text-xs text-gray-700">
                      <strong>PRIORITY:</strong> Join Data team's SQL Guild immediately. Build "Finance Report Generator" agent 
                      leveraging Data's 92% metric summarization effectiveness. <strong>Target: 24 hours/week savings in 7 weeks.</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cross-Department Opportunities */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Cross-Department Collaboration Opportunities</h2>
                  <p className="text-sm text-gray-600">High-impact initiatives that leverage multiple teams</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">1</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">Sales + CS + Support Email Excellence Program</h3>
                      <p className="text-sm text-gray-700 mb-3">
                        Sales' 92% effective email templates can be adapted for CS (15 people) and Support (20 people). 
                        Run joint training, create shared template library, measure response rate improvements.
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-4">
                          <div>
                            <p className="text-xs text-gray-600">Teams Involved</p>
                            <p className="text-sm font-bold text-indigo-900">3 departments</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">People Impacted</p>
                            <p className="text-sm font-bold text-indigo-900">63 employees</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Expected Impact</p>
                            <p className="text-sm font-bold text-indigo-900">+65 hours/week</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">
                          HIGHEST ROI
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">2</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">Data + Finance + Ops SQL Knowledge Sharing</h3>
                      <p className="text-sm text-gray-700 mb-3">
                        Data team's 87% SQL effectiveness and query optimization skills can accelerate Finance and Ops reporting. 
                        Weekly office hours, shared query library, peer review sessions.
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-4">
                          <div>
                            <p className="text-xs text-gray-600">Teams Involved</p>
                            <p className="text-sm font-bold text-blue-900">3 departments</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">People Impacted</p>
                            <p className="text-sm font-bold text-blue-900">28 analysts</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Expected Impact</p>
                            <p className="text-sm font-bold text-blue-900">+40 hours/week</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                          QUICK WIN
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">3</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">Engineering + Product + Design Review Workflow Standardization</h3>
                      <p className="text-sm text-gray-700 mb-3">
                        Engineering's 89% code review workflow can be adapted for design critiques, spec reviews, and PRD feedback. 
                        Create unified review process across product development.
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-4">
                          <div>
                            <p className="text-xs text-gray-600">Teams Involved</p>
                            <p className="text-sm font-bold text-green-900">3 departments</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">People Impacted</p>
                            <p className="text-sm font-bold text-green-900">75+ employees</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Expected Impact</p>
                            <p className="text-sm font-bold text-green-900">+30 hours/week</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                          STRATEGIC
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'tasks' && (
          <>
            {/* Top Tasks Table */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Top Tasks</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Task</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Department</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Count</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg Time Saved</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Effectiveness</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topTasks.map((task, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{task.task}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {task.dept}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-gray-900">{task.count}</td>
                        <td className="py-3 px-4 text-sm text-right text-gray-900">{task.avgTime} min</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${task.quality * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">{(task.quality * 100).toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedTask(task.task)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Use Cases
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Time Saved by Department */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Time Saved by Department</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.deptActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="dept" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="timeSaved" fill="#3b82f6" name="Time Saved (min)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            {uploadedData 
              ? 'Dashboard displaying data from uploaded file' 
              : 'Dashboard showing sample data • Upload your JSONL file to see real metrics'}
          </p>
        </div>
      </div>

      {/* Use Case Modal */}
      {selectedTask && (
        <UseCaseModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default Threadsense;
