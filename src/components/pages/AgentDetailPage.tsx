import { useParams, useNavigate } from 'react-router';
import { UserMode } from '../../App';
import { mockAgents } from '../../data/mockData';
import {
  ArrowLeft, Bot, Cpu, Wrench, Users, CheckCircle2, Code2, Copy, BookOpen,
  Download, AlertCircle, Play, Package, X, Send, Sparkles, Loader2,
  BarChart3, FileText, Microscope, Brain, Search, Globe, Database, Shield,
  Activity,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface AgentDetailPageProps { userMode: UserMode; }

// ═══════════════════════════════════════════════════════════════
// Icon mapping
// ═══════════════════════════════════════════════════════════════
const agentIcons: Record<string, any> = {
  '信用': Shield, '舆情': Search, '价格': BarChart3, '产量': FileText,
  '研报': BookOpen, '库存': Database, '装港': Globe, '滞期': Globe,
  '三峡': Globe, '供应': Brain, '供需': Brain, '需求': Brain,
  '公路': Users, '国际': Globe, '干散': Globe, '气象': Microscope,
  '监测': Search, '分析': Brain, '报告': FileText, '匹配': Users,
  '算力': Cpu, '数据资产': Database, '运营': BarChart3, '评测': Shield, '知识图谱': Brain,
  '基础信息': Database, '运行日志': Activity, '技术架构': Cpu, '效果能力': BarChart3,
  '使用情况': Users, '业务指标': BarChart3, '综合评分': Sparkles, '问题归因': Brain, '评估报告': FileText,
};
function getAgentIcon(name: string) {
  for (const [key, Icon] of Object.entries(agentIcons)) {
    if (name.includes(key)) return Icon;
  }
  return Bot;
}

// ═══════════════════════════════════════════════════════════════
// Per-agent detail data (from Excel 业务指标 + 模型评测指标)
// ═══════════════════════════════════════════════════════════════
export interface AgentDetail {
  capabilities: string[];
  scenarios: { title: string; desc: string }[];
  inputExample: string;
  inputFormats: string;
  outputItems: string[];
  businessKpi?: { metric: string; target: string };
  algorithms?: string[];
  trialResponse: string;
}

export const AGENT_DETAILS: Record<string, AgentDetail> = {
  // ── L1 通用 ──
  '1': { // 信用智能体
    capabilities: [
      '引入行业领域专家构造信用专业问答对，精准微调模型',
      '基于"通专融合"技术架构SAGE打造的235B科学多模态大模型',
      '对信用领域的行业计算、场景推导、专业判断有精准预测能力',
    ],
    scenarios: [
      { title: '企业信用评估', desc: '对供应链上下游企业进行多维度信用评级与风险画像分析' },
      { title: '信用风险预警', desc: '持续监控企业信用变动，对司法风险、财务异常等触发自动预警' },
    ],
    inputExample: '"请评估某供应商的信用等级，该企业注册资本5000万，主营大豆贸易，近期有一条司法诉讼记录"',
    inputFormats: '文本查询、企业名称/统一社会信用代码',
    outputItems: ['企业信用评分（0-100分）', '风险等级评定（AAA/AA/A/BBB...）', '关键风险因子分析报告', '信用趋势变化预警'],
    businessKpi: { metric: '供应链信用领域问答回复相关性', target: '≥80%' },
    trialResponse: '已对该供应商进行多维度信用分析：\n\n1. 信用评分：78分（良好）\n2. 风险等级：AA级\n3. 风险因子识别：\n   - 司法诉讼记录1条（中风险）\n   - 注册资本充足，经营年限>5年（正向因子）\n   - 大豆贸易行业波动性中等\n4. 建议：可正常合作，建议关注诉讼进展',
  },
  '2': { // 舆情智能体
    capabilities: [
      '引入行业领域专家构造舆情专业问答对，精准微调模型',
      '精准匹配供应链业务场景，契合行业规范',
      '对舆情领域的行业计算、场景推导、专业判断有精准预测能力',
    ],
    scenarios: [
      { title: '供应链舆情监控', desc: '全网追踪供应链相关政策、贸易摩擦、市场异动等舆情信息' },
      { title: '市场情绪研判', desc: '分析大宗商品市场情绪倾向，辅助交易与库存决策' },
    ],
    inputExample: '"近期大豆市场有哪些重要舆情变化？对采购策略有什么影响？"',
    inputFormats: '文本查询、关键词订阅',
    outputItems: ['舆情事件汇总与情感倾向分析', '关键事件影响评估', '市场情绪指数趋势', '策略建议与风险预警'],
    businessKpi: { metric: '供应链舆情领域问答回复准确性', target: '≥80%' },
    trialResponse: '近期大豆市场核心舆情分析：\n\n1.【高关注】美国农业部下调巴西大豆产量预估至1.51亿吨 — 利多\n2.【中关注】中国3月大豆进口量同比增长12% — 需求强劲\n3.【关注】阿根廷比索贬值加速农民卖豆节奏 — 短期供应增加\n\n市场情绪指数：62（偏多）\n建议：关注巴西产区旱情演变，适度增加远期合约头寸',
  },

  // ── 农产品 ──
  '3': { // 粮食产量预测智能体
    capabilities: [
      '结合种植面积因素，深度融合真实气象数据与遥感数据',
      '紧扣农学日历的作物生长节律特征进行建模',
      '实现美国、巴西大豆定产产量预测的多维度分析',
    ],
    scenarios: [
      { title: '大豆产量预测', desc: '预测美国、巴西主产区大豆产量，支持定产前30/60/90天预测' },
      { title: '产量异动分析', desc: '当气象或遥感数据出现异常时，分析对产量的潜在影响' },
    ],
    inputExample: '"预测2026年巴西大豆产量，当前马托格罗索州降水偏少15%"',
    inputFormats: '文本查询、CSV气象数据、遥感影像',
    outputItems: ['主产区产量预测值（万吨）', '预测误差区间与置信度', '关键影响因子贡献分析', '历史产量对比与趋势图'],
    businessKpi: { metric: '粮食主产区产量预测2个月内误差率', target: '≤8%' },
    algorithms: ['XGBoost'],
    trialResponse: '2026年巴西大豆产量预测结果：\n\n预测产量：1.485亿吨（基准情景）\n置信区间：1.42-1.55亿吨\n\n关键影响因子：\n1. 马托格罗索州降水偏少15% — 预计减产约3.2%\n2. 南里奥格兰德州积温正常 — 产量稳定\n3. 种植面积同比增长2.1%\n\n与上年对比：预计同比减少1.8%\n预测误差：基于历史验证MAPE约6.5%',
  },
  '4': { // 粮食价格预测智能体
    capabilities: [
      '深度整合美元汇率、美元指数等关键金融影响指标',
      '结合芝加哥期货价格、密西西比河水位、库存消费比等多维数据',
      '通过多源数据融合建模实现粮食价格短中期预测，支持预测结果与影响因素的关联性分析',
    ],
    scenarios: [
      { title: 'CBOT大豆价格预测', desc: '预测CBOT大豆连续合约未来30天价格走势与波动区间' },
      { title: '价格归因分析', desc: '分析价格波动与各影响因素（汇率、库存、能源价格等）的关联性' },
    ],
    inputExample: '"预测未来30天CBOT大豆连续合约价格走势，当前美元指数为104.5"',
    inputFormats: '文本查询、行情数据API',
    outputItems: ['未来30天价格预测曲线', '价格波动区间与趋势方向', '各影响因子贡献度分析', '历史价格波动规律回溯'],
    businessKpi: { metric: 'CBOT大豆价格波动预测MAPE', target: '≤5%' },
    algorithms: ['LightGBM', 'Quantile Regression'],
    trialResponse: 'CBOT大豆连续合约30天价格预测：\n\n当前价格：1085美分/蒲式耳\n30天预测均价：1112美分/蒲式耳（+2.5%）\n趋势方向：震荡偏强\n\n核心驱动因子：\n1. 美元指数104.5（中性，权重18%）\n2. 巴西大豆产量预期下调（利多，权重32%）\n3. 库存消费比处于历史低位（利多，权重25%）\n4. 密西西比河水位正常（中性，权重8%）\n\n近90天验证MAPE：4.2%',
  },
  '5': { // 国际干散货海运运价研报智能体
    capabilities: [
      '聚焦核心航线运价预测与市场分析，融合多维数据与可解释算法',
      '提供短期/中长期运价预测、结构化研报生成、运价归因分析及情景仿真服务',
      '覆盖多船型市场全维度洞察，构建"可预测、可量化、可解释"的运价分析新范式',
    ],
    scenarios: [
      { title: '核心航线运价预测', desc: '预测C3巴西-青岛、C5西澳-青岛等核心航线干散货运价' },
      { title: '航运市场研报', desc: '自动生成干散货海运市场周报，包含BDI分析与运价展望' },
    ],
    inputExample: '"预测未来14天C3航线（巴西-青岛）运价走势"',
    inputFormats: '文本查询、航线代码',
    outputItems: ['短期（14天）运价预测值', '中长期趋势预测（DA>0.9）', '运价归因分析（各因子贡献度）', '情景仿真结果'],
    businessKpi: { metric: '核心航线短期（14天）预测MAPE', target: '≤5%' },
    algorithms: ['LightGBM', '自研MCTS神经网络'],
    trialResponse: 'C3航线（巴西图巴朗-青岛）14天运价预测：\n\n当前运价：$21.5/吨\n14天预测均价：$22.8/吨（+6.0%）\n趋势方向：温和上涨\n\n驱动因子分析：\n1. 巴西大豆出口季需求旺盛（权重35%，利多）\n2. 运力供给偏紧，海岬型船交付放缓（权重28%，利多）\n3. 燃油价格稳定（权重15%，中性）\n4. 中国铁矿石进口需求平稳（权重12%，中性）\n\n预测置信度：85%\n近期验证MAPE：3.8%',
  },
  '6': { // 库存智能分析智能体
    capabilities: [
      '融合库存、巡库、无人机状态与飞行日志等数据',
      '集成天气、价格及舆情等多维信息提供实时问答服务',
      '自动生成巡库日报、周报、月报及专业分析报告，支撑精细化管理与决策',
    ],
    scenarios: [
      { title: '无人机智能巡库', desc: '自动规划无人机巡检路径，精准计算粮仓内粮食堆体体积' },
      { title: '库存异常预警', desc: '监测粮食库存温湿度、虫害等异常指标，自动触发预警' },
    ],
    inputExample: '"查询3号粮仓当前库存量和最近一次巡检结果"',
    inputFormats: '文本查询、仓库编号',
    outputItems: ['粮仓库存量（吨）与历史变化趋势', '无人机巡检影像与堆体体积分析', '温湿度/虫害异常预警', '巡库日报/周报/月报'],
    businessKpi: { metric: 'AI无人机巡库识别误差率', target: '≤5%' },
    algorithms: ['2.5D栅格法'],
    trialResponse: '3号粮仓查询结果：\n\n库存状态：\n- 当前存量：12,450吨（玉米）\n- 仓容利用率：83%\n- 入库日期：2026-01-15\n\n最近巡检（2026-03-22 14:30）：\n- 无人机编号：UAV-007\n- 堆体体积：15,680m³（误差±2.3%）\n- 温度：18.5°C（正常）\n- 湿度：62%（正常）\n- 虫害检测：未发现异常\n\n综合评价：库存状态良好，无需预警',
  },
  '7': { // 进口大豆装港风险预警智能体
    capabilities: [
      '依托XGBoost、LSTM等核心预测模型进行风险建模',
      '整合巴西港口静态数据、作业数据、政治舆情数据、气象数据及船舶航行数据',
      '自动识别装港拥堵诱因并量化风险等级，输出精准预警信息',
    ],
    scenarios: [
      { title: '装港拥堵预警', desc: '预判巴西桑托斯、帕拉纳瓜等港口的装港拥堵风险与等泊天数' },
      { title: '运输调度优化', desc: '为进口大豆船舶提供最优装港时间窗口建议' },
    ],
    inputExample: '"查询桑托斯港未来7天装港拥堵风险，有3艘船预计到港"',
    inputFormats: '文本查询、船舶MMSI号、到港计划',
    outputItems: ['装港拥堵风险等级（高/中/低）', '预计等泊天数与作业时间', '拥堵核心诱因分析', '最优装港时间窗口建议'],
    businessKpi: { metric: '滞期风险预测提前5天准确率', target: '≥70%' },
    algorithms: ['XGBoost', 'LSTM'],
    trialResponse: '桑托斯港未来7天装港风险预警：\n\n风险等级：中等偏高\n预计等泊天数：3-5天\n\n风险因子分析：\n1. 当前排队量：28艘（同期均值22艘）\n2. 天气预报：3月25-27日有中雨，可能影响作业效率\n3. 港口罢工风险：近期无相关舆情\n\n3艘待到港船舶建议：\n- 船舶A（3/25到港）：建议维持计划，预计等泊4天\n- 船舶B（3/27到港）：建议延迟1-2天到港\n- 船舶C（3/30到港）：风险较低，可按计划执行',
  },

  // ── 铁矿石 ──
  '9': { // 价格预测智能体
    capabilities: [
      '穿透市场噪音，科学量化政策、成本、情绪、金融属性等多重因子对价格的影响路径',
      '为现货采购定价、期货套保、库存重估等关键业务提供可解释、可回溯、可操作的价格研判依据',
      '实现铁矿石期货主力合约中短期价格高精度预测',
    ],
    scenarios: [
      { title: '期货价格预测', desc: '预测铁矿石期货主力合约周度价格走势与波动区间' },
      { title: '套保决策支持', desc: '基于价格预测为期货套保操作提供时机与头寸建议' },
    ],
    inputExample: '"预测本周铁矿石期货主力合约价格走势，当前钢厂利润为负"',
    inputFormats: '文本查询、期货行情数据',
    outputItems: ['周度价格预测值与方向', '价格预测区间与置信度', '多因子贡献度分析', '套保操作建议'],
    businessKpi: { metric: '周度价格预测趋势准确率达70%，价格误差率', target: '≤5%' },
    algorithms: ['BiLSTM', 'LightGBM', '线性回归'],
    trialResponse: '铁矿石期货主力合约本周预测：\n\n当前价格：825元/吨\n本周预测均价：812元/吨（-1.6%）\n趋势方向：偏弱震荡\n\n核心因子分析：\n1. 钢厂利润转负 — 减产预期增强（权重30%）\n2. 港口库存1.45亿吨，中高位（权重22%，利空）\n3. 澳洲发运恢复正常（权重18%，利空）\n4. 发改委稳增长基调未变（权重15%，中性偏多）\n\n趋势准确率：近12周验证75%\n价格误差率MAPE：4.1%',
  },
  '10': { // 供应分析智能体
    capabilities: [
      '刻画从矿山开采到中国港口卸货的全链条供应能力演变',
      '识别资源窗口期与供应链脆弱点',
      '为长协履约管理、现货采购节奏、物流调度及应急储备提供前瞻性洞察',
    ],
    scenarios: [
      { title: '全球铁矿石供应监控', desc: '追踪四大矿山及中小矿山的产能变化、检修计划与发运量' },
      { title: '供应风险预警', desc: '识别极端天气、港口罢工等对铁矿石供应链的潜在影响' },
    ],
    inputExample: '"分析本月澳洲铁矿石发运量变化，是否受到飓风季影响"',
    inputFormats: '文本查询、AIS船舶数据',
    outputItems: ['全球铁矿石发运量预测', '矿山产能利用率与检修计划', '供应链风险事件识别与评级', '分航线到港量预测'],
    algorithms: ['ARIMA', 'XGBoost', 'LightGBM'],
    trialResponse: '本月澳洲铁矿石发运量分析：\n\n3月发运量预测：7,850万吨（同比+2.3%）\n飓风季影响评估：轻微\n\n分矿山分析：\n1. 力拓：2,680万吨（正常水位）\n2. 必和必拓：2,320万吨（3/15-20因港口维护减少约100万吨）\n3. FMG：1,850万吨（产能爬坡中）\n4. 其他：1,000万吨\n\n风险提示：\n- 4月初西澳或有热带气旋（概率25%）\n- 淡水河谷S11D检修计划：4/10-4/20',
  },
  '11': { // 供需平衡智能体
    capabilities: [
      '聚合供应、需求、价格三类智能体的预测输出，构建"供应-需求-库存"动态平衡模型',
      '识别结构性缺口或过剩',
      '为战略储备、进口调配、市场干预等高层决策提供全景式洞察',
    ],
    scenarios: [
      { title: '供需平衡表分析', desc: '构建月度/季度铁矿石供需平衡表，识别缺口或过剩' },
      { title: '情景模拟', desc: '模拟不同政策、需求、供应情景下的供需平衡变化' },
    ],
    inputExample: '"构建Q2铁矿石供需平衡表，考虑钢厂限产20%的情景"',
    inputFormats: '文本指令、情景参数设定',
    outputItems: ['月度/季度供需平衡表', '库存变动趋势预测', '情景模拟对比分析', '战略建议与风险提示'],
    trialResponse: 'Q2铁矿石供需平衡表（限产20%情景）：\n\n供应端：进口2.85亿吨/季 + 国产矿0.68亿吨 = 3.53亿吨\n需求端：粗钢2.12亿吨，铁矿消耗3.18亿吨/季\n\n平衡结果：季度过剩 +3,500万吨\n港口库存预计升至1.65亿吨\n\n战略建议：\n1. 减少长协外现货采购比例\n2. 适度降低安全库存水位\n3. 关注限产政策执行力度变化',
  },
  '12': { // 公路段货找车智能体
    capabilities: [
      '基于HiAgent技术底座搭建，深度融合大模型与物流货主业务逻辑',
      '聚焦货源精准匹配、运费实时预估两大核心场景',
      '通过货源画像与运力标签智能匹配、运输成本精准测算，大幅提升对接效率与成单率',
    ],
    scenarios: [
      { title: '货源智能匹配', desc: '根据货物属性、时效要求、起终点自动匹配最优运力方案' },
      { title: '运费实时预估', desc: '基于路线、车型、市场行情等因子精准预估运输费用' },
    ],
    inputExample: '"需要从青岛港运送500吨大豆到郑州仓库，要求3天内到达，帮我匹配运力"',
    inputFormats: '文本查询、货物属性、起终点地址',
    outputItems: ['匹配运力方案列表（含车型/价格/时效）', '推荐最优方案及理由', '运费预估明细', '实时车辆位置追踪'],
    businessKpi: { metric: 'AI成单率', target: '>50%' },
    algorithms: ['聚类算法', 'RF权重计算'],
    trialResponse: '已为您匹配以下运力方案：\n\n方案A（推荐）：\n- 车型：半挂车×2，单车25吨\n- 预计运费：¥18,500（¥37/吨）\n- 预计时效：2.5天\n- 司机评分：4.8/5.0\n\n方案B：\n- 车型：全挂车×3\n- 预计运费：¥17,200（¥34.4/吨）\n- 预计时效：3天\n- 司机评分：4.5/5.0\n\n方案C：铁路+短驳\n- 预计运费：¥15,800（¥31.6/吨）\n- 预计时效：4天\n\n推荐方案A，兼顾时效与服务质量',
  },
  '13': { // 公路段车找货智能体
    capabilities: [
      '基于HiAgent技术底座搭建，深度融合大模型与物流车主业务逻辑',
      '聚焦优质货源匹配、回头车利用率提升、运费精准预估三大核心场景',
      '通过实时抓取优质货源、智能规划路线减少空驶、精准测算单航次收益',
    ],
    scenarios: [
      { title: '回头货匹配', desc: '为空驶返程车辆智能匹配沿途或目的地附近货源，减少空驶率' },
      { title: '收益优化', desc: '精准测算单航次收益，帮助司机选择最优货源方案' },
    ],
    inputExample: '"我的车从郑州卸货后要空驶回青岛，沿途有没有合适的货源？"',
    inputFormats: '文本查询、车辆位置、车型信息',
    outputItems: ['沿途可匹配货源列表', '各货源收益测算对比', '推荐路线规划', '预计空驶率降低幅度'],
    businessKpi: { metric: '平台回头车利用率', target: '>3%' },
    algorithms: ['聚类算法', 'RF权重计算'],
    trialResponse: '从郑州返回青岛沿途匹配到以下货源：\n\n货源1（推荐）：\n- 货物：面粉200吨\n- 起点：商丘市 → 终点：济南市\n- 运费：¥6,200\n- 顺路度：92%\n\n货源2：\n- 货物：化肥150吨\n- 起点：菏泽市 → 终点：潍坊市\n- 运费：¥5,800\n- 顺路度：85%\n\n货源3：\n- 货物：建材80吨\n- 起点：开封市 → 终点：青岛市\n- 运费：¥4,500\n- 顺路度：98%\n\n推荐货源1，收益最优且顺路度高',
  },
  '14': { // 全球气象智能体
    capabilities: [
      '以自然交互形式提供全球历史气象数据回溯服务',
      '支持未来气象预测查询（中短期0-15天与次季节0-90天）',
      '提供极端天气实时预警，实现气象信息"即查即用"',
    ],
    scenarios: [
      { title: '全球气象预测查询', desc: '查询全球任意区域的中短期天气预报与次季节气候展望' },
      { title: '极端天气预警', desc: '实时监测台风、暴雨、高温等极端天气并推送预警' },
    ],
    inputExample: '"查询未来15天巴西马托格罗索州的降水和温度预测"',
    inputFormats: '文本查询、地理坐标/区域名称',
    outputItems: ['中短期（0-15天）气象要素预测', '次季节（0-90天）气候趋势展望', '极端天气预警信息', '历史同期气象对比'],
    businessKpi: { metric: '预测数据平均RMSE相较于IFS改进', target: '≥5%' },
    algorithms: ['Transformer', '3D CNN', '时空注意力机制'],
    trialResponse: '巴西马托格罗索州未来15天气象预测：\n\n温度：\n- 日均温度：28-32°C（偏高1-2°C）\n- 最高温度：35°C（3/28-3/30）\n\n降水：\n- 总降水量：45mm（偏少35%）\n- 主要降水：3/25-3/26（20mm），其余以零星阵雨为主\n\n关键预警：\n- 3/28-4/2高温少雨，可能加剧旱情\n- 对大豆灌浆期有不利影响\n\n历史对比：近5年同期平均降水69mm\n预测RMSE相较IFS改进：8.2%',
  },
  '15': { // 信息监测智能体
    capabilities: [
      '依托多源异构数据实时采集技术，全天候追踪全球官方政策发布、宏观经济变动与大宗商品市场动态',
      '支持企业根据实际业务线配置自定义预警规则与风险阈值',
      '通过数据交叉比对对供应链中断、价格剧烈波动等风险进行早期识别与自动化预警',
    ],
    scenarios: [
      { title: '政策法规监测', desc: '实时追踪各部委、海关、商务部等部门的政策文件与法规变动' },
      { title: '市场风险预警', desc: '监测大宗商品市场异动，对价格剧烈波动等风险自动预警' },
    ],
    inputExample: '"监测近期与大豆进口相关的政策变动和市场风险"',
    inputFormats: '文本查询、关键词订阅、预警规则配置',
    outputItems: ['政策变动实时推送', '市场异动预警信息', '风险等级评定', '历史政策追溯'],
    trialResponse: '近期大豆进口相关政策与市场监测：\n\n【政策动态】\n1. 商务部发布2026年大豆进口配额调整通知 — 配额量维持不变\n2. 海关总署优化农产品进口检疫流程 — 通关效率预计提升15%\n3. 巴西政府宣布延长出口税减免至6月底\n\n【市场异动】\n1. CBOT大豆单日涨幅超3%（3/20）— 已触发预警\n2. 巴西雷亚尔兑美元跌至5.28 — 关注汇率风险\n\n风险等级：中等\n建议：密切关注巴西出口政策变化与汇率走势',
  },

  // ── 平台运维 ──
  '16': { // 算力调度智能体
    capabilities: [
      '实时监测智算与通算混合集群的NPU/CPU使用率、显存占用及任务队列深度',
      '基于负载预测与弹性伸缩策略实现算力资源最优分配',
      '自动检测算力卡故障并触发任务迁移与集群自愈',
    ],
    scenarios: [
      { title: '算力资源监控', desc: '全景展示智算服务器、通算集群的实时负载与资源利用率' },
      { title: '弹性调度优化', desc: '根据任务优先级与资源预测，自动调整算力分配策略' },
    ],
    inputExample: '"当前集群NPU使用率已达85%，请分析瓶颈并给出调度建议"',
    inputFormats: '文本查询、集群名称/ID',
    outputItems: ['集群资源实时看板（NPU/CPU/内存）', '负载趋势预测（未来4小时）', '调度策略优化建议', '故障风险预警'],
    businessKpi: { metric: '算力卡服役率', target: '≥95%' },
    algorithms: ['XGBoost', 'LSTM'],
    trialResponse: '集群算力分析报告：\n\nNPU集群状态：\n- 总卡数：384张（48台智算服务器×8卡）\n- 在用：326张（84.9%）\n- 空闲：42张（10.9%）\n- 故障/维护：16张（4.2%）\n\n瓶颈分析：\n1. GPU-Node-23/24 两台节点NPU使用率持续>95%，任务队列积压\n2. 大模型推理任务占比68%，训练任务32%\n3. 峰值时段（10:00-16:00）资源利用率达92%\n\n调度建议：\n1. 将低优先级训练任务调度至夜间时段\n2. 启用Node-31/32备用节点分流推理负载\n3. 建议对Node-23进行显存碎片清理',
  },
  '17': { // 数据资产治理智能体
    capabilities: [
      '覆盖采销、仓储、运输、风控、生态五大业务域的数据集全生命周期治理',
      '自动完成数据质量评估、元数据标注与血缘关系追溯',
      '支持合规性审查，保障数据资产可发现、可信赖、可追溯',
    ],
    scenarios: [
      { title: '数据质量评估', desc: '自动扫描数据集的完整性、一致性与时效性，生成质量评分报告' },
      { title: '数据血缘追溯', desc: '追溯数据从采集到消费的完整链路，定位数据问题根因' },
    ],
    inputExample: '"评估采销服务专识数据集的数据质量，并追溯数据来源"',
    inputFormats: '文本查询、数据集ID/名称',
    outputItems: ['数据质量评分（完整性/一致性/时效性）', '元数据标签与描述', '血缘关系图谱', '合规性审查报告'],
    businessKpi: { metric: '数据集质量达标率', target: '≥90%' },
    algorithms: ['NLP实体抽取', 'LightGBM异常检测'],
    trialResponse: '采销服务专识数据集质量评估报告：\n\n数据集概况：\n- 总记录数：1,245,680条\n- 时间跨度：2023-01 至 2026-03\n- 更新频率：T+1\n\n质量评分：87/100\n- 完整性：92%（缺失字段主要集中在供应商联系方式）\n- 一致性：89%（3处编码规范不统一）\n- 时效性：95%（最新数据延迟<2小时）\n- 准确性：85%（抽样校验误差率1.2%）\n\n血缘追溯：\n- 数据源：ERP采购模块 → ETL清洗 → 数据湖 → 特征加工\n- 下游消费：信用智能体、库存分析智能体\n\n建议：补全供应商联系方式字段，统一编码规范',
  },
  '18': { // 应用运营分析智能体
    capabilities: [
      '实时追踪智能体Token消耗、QPS、请求成功率等核心性能指标',
      '结合渠道分布与用户行为数据输出运营健康度评分',
      '对性能异动进行多维归因分析并推荐资源优化策略',
    ],
    scenarios: [
      { title: '运营健康度监控', desc: '全景展示各智能体的调用量、Token消耗、响应时延等运营指标' },
      { title: '异动归因分析', desc: '当指标出现异动时，自动定位根因并推荐优化措施' },
    ],
    inputExample: '"分析过去7天信用智能体的Token消耗趋势和请求成功率变化"',
    inputFormats: '文本查询、智能体名称、时间范围',
    outputItems: ['Token消耗趋势（Total/Input/Output）', 'QPS与请求成功率时序图', '渠道分布分析', '异动归因与优化建议'],
    businessKpi: { metric: '平台整体请求成功率', target: '≥99%' },
    algorithms: ['ARIMA', 'Isolation Forest'],
    trialResponse: '信用智能体近7天运营分析：\n\nToken消耗：\n- 总消耗：285,600 tokens（日均40,800）\n- 输入：112,400 tokens（39.4%）\n- 输出：173,200 tokens（60.6%）\n- 环比变化：+12.3%\n\n请求成功率：\n- 7天均值：97.5%\n- 最低点：3/20 15:00 — 94.2%（原因：下游征信API超时）\n- 当前状态：99.1%（已恢复正常）\n\n渠道分布：\n- API调用：68%\n- 网页访问：22%\n- 智能体调试：10%\n\n优化建议：\n1. 征信API增加超时重试机制\n2. 输出Token较高，建议优化Prompt减少冗余输出',
  },
  '19': { // 智能体评测智能体
    capabilities: [
      '从准确率、响应时延、Token效率、业务指标达成率等维度构建标准化评测体系',
      '支持A/B测试与版本基线对比',
      '为智能体迭代升级提供量化决策依据',
    ],
    scenarios: [
      { title: '版本评测对比', desc: '对比智能体新旧版本在准确率、延迟等维度的性能差异' },
      { title: '业务指标验证', desc: '验证智能体业务KPI达成情况，如预测准确率、成单率等' },
    ],
    inputExample: '"对比价格预测智能体v2.0和v1.8的预测准确率"',
    inputFormats: '文本查询、智能体版本号',
    outputItems: ['多维评测评分报告', 'A/B版本对比分析', '业务KPI达成情况', '升级/回滚建议'],
    algorithms: ['统计检验', '贝叶斯优化'],
    trialResponse: '价格预测智能体版本对比评测：\n\n评测用例集：200条历史样本\n\nv2.0 vs v1.8：\n┌─────────────┬────────┬────────┐\n│ 指标         │ v2.0   │ v1.8   │\n├─────────────┼────────┼────────┤\n│ MAPE        │ 4.1%   │ 5.7%   │\n│ 趋势准确率   │ 75%    │ 68%    │\n│ 平均延迟     │ 3.5s   │ 4.2s   │\n│ Token消耗    │ 1,850  │ 2,340  │\n│ 业务达标     │ ✓      │ ✗      │\n└─────────────┴────────┴────────┘\n\n结论：v2.0在所有维度均优于v1.8\n建议：推荐升级至v2.0，预测精度提升28%',
  },
  '20': { // 知识图谱构建智能体
    capabilities: [
      '从研报、政策文件等非结构化文档中自动抽取实体关系',
      '构建涵盖品种、港口、船舶、企业、政策等核心节点的行业知识图谱',
      '为各业务智能体提供知识推理底座，支持跨域关联查询',
    ],
    scenarios: [
      { title: '知识图谱构建', desc: '从海量文档中自动抽取实体与关系，构建供应链行业知识图谱' },
      { title: '关联知识查询', desc: '基于图谱进行多跳推理，发现隐性关联关系' },
    ],
    inputExample: '"查询与巴西桑托斯港相关的所有大豆贸易实体和风险事件"',
    inputFormats: '文本查询、实体名称',
    outputItems: ['实体关系图谱可视化', '关联实体列表与属性', '风险传导路径分析', '知识图谱更新日志'],
    algorithms: ['BERT NER', 'TransE关系推理'],
    trialResponse: '桑托斯港关联知识图谱查询结果：\n\n核心实体：桑托斯港（Porto de Santos）\n- 类型：港口\n- 国家：巴西\n- 年吞吐量：1.4亿吨\n\n关联实体（大豆贸易）：\n1. 【企业】中粮国际 — 长期装港协议\n2. 【企业】嘉吉巴西 — 仓储设施租赁\n3. 【航线】C3航线 — 桑托斯→青岛\n4. 【品种】巴西大豆 — 年出口约4,500万吨\n\n风险事件（近12月）：\n1. 2025-11：港口工人罢工48小时 — 影响等级：中\n2. 2026-02：暴雨致装港延误3天 — 影响等级：低\n3. 2026-03：泊位检修 — 影响等级：低\n\n风险传导路径：港口拥堵 → 运价上涨 → 到港延迟 → 压榨利润波动',
  },

  // ── 智能体评估（与编排工作流无关） ──
  'eval-basic-info': {
    capabilities: [
      '从注册中心与配置中心拉取智能体元数据、版本与部署信息',
      '支持多条件组合检索与配置快照导出',
      '为后续评估步骤提供一致的基础数据口径',
    ],
    scenarios: [
      { title: '评估前置核对', desc: '确认待评估智能体的名称、版本、负责人与环境信息' },
      { title: '配置审计', desc: '对比不同环境或版本的配置差异' },
    ],
    inputExample: '"查询智能体「价格预测智能体」生产环境 v2.0 的基础信息与配置摘要"',
    inputFormats: '文本查询、智能体 ID / 名称',
    outputItems: ['元数据清单', '配置快照', '环境与依赖说明'],
    businessKpi: { metric: '元数据查询完整率', target: '≥99%' },
    trialResponse: '「价格预测智能体」生产环境 v2.0 基础信息：\n\n- 注册 ID：9\n- 版本：v2.0.0\n- 负责人：铁矿石团队\n- 部署：k8s/prod-east，副本 3\n- 模型：铁矿石期货价格预测模型\n- 最近配置变更：2026-02-28（调大 max_tokens）',
  },
  'eval-runtime-logs': {
    capabilities: [
      '按时间、trace、错误码与关键词检索推理与系统日志',
      '关联单次请求的上下游 span，便于抽样评估与排障',
    ],
    scenarios: [
      { title: '评估取样', desc: '抽取一段时间内的成功/失败请求用于人工或自动评估' },
      { title: '线上排障', desc: '根据异常栈与限流记录定位问题' },
    ],
    inputExample: '"列出「舆情智能体」昨天 HTTP 5xx 且含 timeout 的日志前 20 条"',
    inputFormats: '文本查询、时间范围、traceId',
    outputItems: ['日志条目列表', '错误分布统计', '关联 trace 链接'],
    trialResponse: '「舆情智能体」昨日 5xx + timeout 抽样（20 条）：\n\n- 共命中 47 次，以下为前 20 条摘要\n- 主要错误：upstream deadline（62%）、rate limit（21%）\n- 高峰时段：14:00–16:00\n- 建议：检查上游情感分析服务超时配置',
  },
  'eval-arch-tech': {
    capabilities: [
      '对照检查清单评审模型、工具、上下文与安全边界',
      '输出符合度评分与可执行的架构改进建议',
    ],
    scenarios: [
      { title: '上线前评审', desc: '新版本发布前的技术方案复核' },
      { title: '架构债梳理', desc: '识别单点、过度耦合与扩展瓶颈' },
    ],
    inputExample: '"对「全球气象智能体」当前技术架构做评估并给出优先级最高的 3 条建议"',
    inputFormats: '文本查询、架构说明或仓库引用',
    outputItems: ['维度得分', '风险与缺口列表', '改进建议与优先级'],
    trialResponse: '「全球气象智能体」架构评估摘要：\n\n维度得分：模型选型 88 / 工具链 82 / 安全 76 / 可扩展 80\n\n优先建议：\n1. 为卫星云图 API 增加熔断与降级路径（高）\n2. 将长上下文会话改为滑动窗口+摘要（高）\n3. 工具调用权限按角色最小化（中）',
  },
  'eval-effect-capability': {
    capabilities: [
      '基于标准题集与领域用例自动跑批并判分',
      '覆盖相关性、事实性、工具调用与拒答等维度',
    ],
    scenarios: [
      { title: '效果基线', desc: '建立版本间可对比的效果指标' },
      { title: '回归检测', desc: '模型或提示词变更后的质量回归预警' },
    ],
    inputExample: '"用评测集 B 跑「信用智能体」v2.1.0 并给出各维度得分"',
    inputFormats: '文本查询、评测集 ID、版本号',
    outputItems: ['各维度得分', '错题样例', '与上一版本对比'],
    businessKpi: { metric: '标准题集综合分', target: '≥85' },
    trialResponse: '「信用智能体」v2.1.0 × 评测集 B：\n\n- 相关性：86.2  事实一致性：84.0  工具正确率：91.5  拒答合理性：88.0\n- 综合：87.4（较 v2.0.9 +1.1）\n- 典型错题：案例 #128 司法数据时效性表述偏乐观',
  },
  'eval-usage': {
    capabilities: [
      '统计 DAU、会话深度、留存与渠道分布',
      '识别高频意图与低渗透能力，辅助产品迭代排序',
    ],
    scenarios: [
      { title: '运营复盘', desc: '周期性使用情况与健康度回顾' },
      { title: '能力冷启动', desc: '发现未被使用的工具或子能力' },
    ],
    inputExample: '"分析「公路段货找车智能体」近 30 天使用情况及 Top 意图"',
    inputFormats: '文本查询、时间窗口',
    outputItems: ['活跃与留存指标', '意图分布', '会话深度分布', '建议'],
    trialResponse: '「公路段货找车智能体」近 30 天：\n\n- DAU 峰值 1.2k，7 日留存 34%\n- Top 意图：运费预估（41%）、运力匹配（33%）、时效查询（18%）\n- 冷门：多式联运衔接说明仅 3% 触达\n- 建议：在首页强化「联运」入口与示例问法',
  },
  'eval-biz-metrics': {
    capabilities: [
      '将调用与输出结果与业务 KPI 对齐并计算达成率',
      '支持贡献分解与对照组对比',
    ],
    scenarios: [
      { title: '业务验收', desc: '项目结项或扩容前的业务指标验证' },
      { title: '价值复盘', desc: '量化智能体对成本、效率或风险的影响' },
    ],
    inputExample: '"评估「进口大豆装港风险预警智能体」本季度预警命中率与避免的滞期成本"',
    inputFormats: '文本查询、KPI 定义、时间范围',
    outputItems: ['KPI 达成率', '贡献分解', '异常区间说明'],
    trialResponse: '「进口大豆装港风险预警智能体」本季度：\n\n- 预警命中率：82%（目标 ≥80%）\n- 经采纳建议减少滞期约 1,850 船时\n- 估算成本影响：约 ¥** 万（口径：日租金×延误）\n- 未达标船次主要集中：突发气象（占 38%）',
  },
  'eval-score-aggregate': {
    capabilities: [
      '按权重融合技术、效果、使用与业务子分',
      '输出总分、雷达图与版本对比',
    ],
    scenarios: [
      { title: '评估看板', desc: '单一入口查看智能体综合健康度' },
      { title: '版本对比', desc: '升级前后综合分变化追踪' },
    ],
    inputExample: '"按默认权重计算「供需平衡智能体」v1.8.0 综合分并与 v1.7.0 对比"',
    inputFormats: '文本查询、权重配置（可选）',
    outputItems: ['综合分', '子维度得分', '雷达对比', '结论摘要'],
    trialResponse: '「供需平衡智能体」综合分（默认权重）：\n\n- v1.8.0 总分：86.3  |  v1.7.0：84.1\n- 子分：技术 88 / 效果 85 / 使用 83 / 业务 87\n- 提升主要来自：效果评测 +2.4（新评测集）、业务 KPI +1.1',
  },
  'eval-root-cause': {
    capabilities: [
      '在评分异常或故障时生成根因假设并排序',
      '串联日志、评测与业务反馈形成证据链',
    ],
    scenarios: [
      { title: '整改闭环', desc: '从现象到可验证原因的追踪' },
      { title: '评估解读', desc: '解释综合分下降的主要驱动因素' },
    ],
    inputExample: '"「应用运营分析智能体」本周综合分下降 4 分，请做归因分析"',
    inputFormats: '文本查询、现象描述、时间范围',
    outputItems: ['假设列表与置信度', '证据引用', '建议验证步骤'],
    trialResponse: '综合分下降 4 分 — 归因摘要：\n\n1. 效果子分 -2.1：上游日志解析规则变更导致 3/18 起误判增多（高置信）\n2. 使用子分 -1.0：某渠道流量骤降，会话深度下降\n3. 业务子分 -0.9：客户侧 KPI 口径调整，非模型问题\n\n建议：先回滚解析规则并补评评测集 C。',
  },
  'eval-report': {
    capabilities: [
      '汇总各评估模块结论生成结构化报告',
      '支持章节模板、图表与导出（PDF/Word）',
    ],
    scenarios: [
      { title: '评估交付', desc: '对内复盘或对外汇报的标准化材料' },
      { title: '定期巡检', desc: '按月/季度输出智能体健康报告' },
    ],
    inputExample: '"生成「智能体评估」专题下全部已发布智能体的 2026Q1 评估报告目录草案"',
    inputFormats: '文本查询、报告模板、时间范围',
    outputItems: ['执行摘要', '分智能体明细', '风险与建议', '附录数据表'],
    trialResponse: '2026Q1 评估报告（目录草案）：\n\n1. 概述与范围\n2. 综合分排名与变化\n3. 分模块发现（基础信息 / 日志 / 架构 / 效果 / 使用 / 业务）\n4. 问题归因与整改项\n5. 下季度计划\n附录：原始指标表、评测集版本说明',
  },

  // ── 草稿箱 ──
  'draft-1': { // 内贸玉米装卸港滞期预警智能体
    capabilities: [
      '基于XGBoost、LSTM等时间序列预测模型进行风险建模',
      '融合内贸港口静态数据、作业数据、气象数据及船舶航行数据',
      '精准预测装卸港等泊及作业时间，自动生成滞期风险预警信息',
    ],
    scenarios: [
      { title: '装卸港滞期预测', desc: '预测内贸玉米装卸港等泊天数与滞期概率' },
      { title: '调度方案优化', desc: '辅助优化装卸调度方案，降低滞期成本' },
    ],
    inputExample: '"预测锦州港下周装船滞期风险，预计有5艘船到港"',
    inputFormats: '文本查询、港口名称、到港计划',
    outputItems: ['滞期风险等级与概率', '预估等泊/作业天数', '滞期核心影响因子', '调度优化建议'],
    algorithms: ['XGBoost', 'LSTM'],
    trialResponse: '锦州港下周玉米装船滞期风险预测：\n\n风险等级：中等\n预估等泊天数：2-3天\n滞期概率：45%\n\n影响因子：\n1. 当前港口泊位利用率：78%（偏高）\n2. 天气预报：无恶劣天气\n3. 预计到港5艘，超出日均处理能力\n\n建议：考虑将2艘船分流至营口港',
  },
  'draft-2': { // 内贸玉米三峡修闸预警智能体
    capabilities: [
      '依托XGBoost、LSTM等核心模型进行过闸时间预测',
      '整合三峡及葛洲坝过闸数据、修闸记录、区域气象数据等关键信息',
      '精准预判修闸期间上行及下行过闸时间与延误风险',
    ],
    scenarios: [
      { title: '修闸预警', desc: '预判三峡船闸检修期间对内贸玉米运输的延误影响' },
      { title: '运输路线规划', desc: '为修闸期间的内贸玉米跨闸运输提供替代路线建议' },
    ],
    inputExample: '"查询4月份三峡船闸检修计划对玉米运输的影响"',
    inputFormats: '文本查询、运输计划',
    outputItems: ['修闸计划与影响时段', '预估过闸延误天数', '替代运输路线方案', '成本影响评估'],
    algorithms: ['XGBoost', 'LSTM'],
    trialResponse: '4月三峡船闸修闸预警：\n\n修闸计划：\n- 时段：4月10日-4月18日\n- 影响闸室：南线船闸（北线正常）\n\n运输影响评估：\n- 预计过闸延误：增加1.5-2天\n- 日通行能力下降约40%\n\n建议：\n1. 4/8前到达的船舶可正常过闸\n2. 4/8-4/18期间建议转至公路或铁路替代运输\n3. 预估增加成本：约15元/吨',
  },
  'draft-3': { // 需求分析智能体
    capabilities: [
      '解构粗钢生产、终端用钢行业景气度与宏观政策导向',
      '系统评估铁矿石消耗强度变化',
      '为采购计划、库存水位设定、长协比例优化提供数据驱动依据',
    ],
    scenarios: [
      { title: '需求量预测', desc: '预测月度/季度铁矿石消耗量，基于钢铁产能与开工率分析' },
      { title: '终端需求研判', desc: '分析房地产、基建、制造业等终端行业对钢铁需求的影响' },
    ],
    inputExample: '"预测Q2铁矿石需求量，考虑当前高炉开工率85%"',
    inputFormats: '文本查询、产业数据',
    outputItems: ['月度/季度铁矿石需求预测', '高炉开工率与产能利用率分析', '终端行业需求景气度评估', '需求变动趋势与预警'],
    algorithms: ['线性回归', 'ARIMA', 'SARIMA'],
    trialResponse: 'Q2铁矿石需求预测（高炉开工率85%）：\n\n需求预测：\n- Q2铁矿石消耗量：3.35亿吨\n- 环比变化：+5.2%（季节性回升）\n- 同比变化：-1.8%\n\n终端行业分析：\n1. 房地产：新开工面积同比-12%，用钢需求持续走弱\n2. 基建：专项债发行加速，用钢需求+8%\n3. 制造业：汽车/家电出口景气，用钢需求+5%\n\n建议：总需求温和回升，维持常规采购节奏',
  },

  // ── 已安装 ──
  'installed-1': { // 粮食气象智能体
    capabilities: [
      '围绕大豆核心产区与生育阶段气象要求特征提供多尺度气象要素查询',
      '支持阶段关联分析与结构化表达能力',
      '将复杂气象数据转译为适合农业模型与分析人员理解和使用的气象影响信息',
    ],
    scenarios: [
      { title: '产区气象查询', desc: '查询美国/巴西大豆主产区各生育阶段的关键气象要素' },
      { title: '气象影响评估', desc: '评估当前气象条件对作物生长和产量的潜在影响' },
    ],
    inputExample: '"查询巴西马托格罗索州大豆灌浆期的降水和温度是否正常"',
    inputFormats: '文本查询、产区名称、生育阶段',
    outputItems: ['多尺度气象要素分析', '生育阶段-气象关联评估', '产量影响预判', '历史同期气象对比'],
    trialResponse: '巴西马托格罗索州大豆灌浆期气象分析：\n\n当前生育阶段：灌浆期（R5-R6）\n\n气象要素：\n- 日均温度：29.5°C（适宜范围25-30°C，正常）\n- 累计降水：45mm/周（需求60-80mm/周，偏少25%）\n- 日照时数：8.5h/天（正常）\n\n影响评估：\n- 降水偏少可能导致百粒重下降\n- 预计减产影响：2-4%\n- 若未来2周降水持续偏少，影响将扩大至5-8%\n\n建议：密切关注未来10天降水预报',
  },
  'installed-2': { // 港口气象智能体
    capabilities: [
      '聚焦港口船舶靠泊与离泊等关键作业场景',
      '围绕"港口位置+作业类型+时间窗口"构建专业化作业气象风险评估能力',
      '实现从数据获取到作业气象条件判断的全流程智能化分析',
    ],
    scenarios: [
      { title: '靠泊气象评估', desc: '评估目标港口未来时间窗口的风力、浪高、能见度等靠泊条件' },
      { title: '作业窗口推荐', desc: '推荐满足安全作业条件的最优时间窗口' },
    ],
    inputExample: '"评估青岛港明天的靠泊条件，船型为海岬型散货船"',
    inputFormats: '文本查询、港口名称、船型、作业类型',
    outputItems: ['风力/浪高/能见度等关键指标预报', '靠泊/离泊安全性评级', '推荐作业时间窗口', '未来72小时气象趋势'],
    trialResponse: '青岛港明日靠泊条件评估（海岬型散货船）：\n\n气象预报：\n- 风力：偏北风4-5级（阵风6级）\n- 浪高：1.2-1.5m\n- 能见度：>10km\n- 潮汐：高潮08:30 / 低潮14:50\n\n靠泊评级：适宜\n- 风力在安全阈值内（海岬型≤6级）\n- 浪高在安全阈值内（≤2.0m）\n- 能见度良好\n\n推荐靠泊窗口：07:00-09:00（利用涨潮）\n\n未来72小时：3/25夜间风力增至6-7级，不建议靠泊',
  },
  'installed-3': { // 信息分析智能体
    capabilities: [
      '结合行业专属经验与大语言模型，具备深度解析大宗商品专有术语与复杂商业语境的能力',
      '以地缘政治与宏观经济变量为基准，对突发事件与政策走向进行逻辑推演',
      '客观评估事件对供应链关键节点（采购成本、物流路由、库存周转）的影响范围',
    ],
    scenarios: [
      { title: '突发事件影响分析', desc: '对地缘政治事件、贸易制裁等突发情况进行供应链影响研判' },
      { title: '政策深度解读', desc: '深度解析政策条文并评估对采购成本、物流路由等的影响' },
    ],
    inputExample: '"分析近期巴西港口工人罢工对大豆出口和运价的影响"',
    inputFormats: '文本查询、事件描述',
    outputItems: ['事件影响范围评估', '供应链关键节点风险分析', '影响持续时间预判', '策略建议与应对方案'],
    trialResponse: '巴西港口工人罢工影响分析：\n\n事件概述：巴西帕拉纳瓜港工人因薪资诉求发起罢工\n\n影响评估：\n1. 大豆出口：\n   - 帕拉纳瓜港占巴西大豆出口约25%\n   - 预计短期出口延迟3-5天\n   - 影响出口量约50-80万吨\n\n2. 运价影响：\n   - 船舶滞港增加，短期运价上涨5-8%\n   - C3航线运价可能突破$23/吨\n\n3. 国内影响：\n   - 4月到港量可能减少60-100万吨\n   - 豆粕现货价格可能上涨50-80元/吨\n\n建议：关注罢工持续时间，做好备选港口调配',
  },
  'installed-4': { // 信息报告智能体
    capabilities: [
      '具备高度自动化的业务报告编排与生成能力',
      '常态化输出包含关键影响因子标注、风险定级矩阵及可视化图表的标准化日/周报',
      '支持机器学习企业历史行文规范，自动对齐内部专业表达与汇报风格',
    ],
    scenarios: [
      { title: '标准化日/周报生成', desc: '自动生成供应链政策舆情日报、周报，含风险定级矩阵与可视化图表' },
      { title: '专项简报生成', desc: '针对贸易限制、制裁等突发议题快速生成专项分析简报' },
    ],
    inputExample: '"生成本周供应链政策舆情周报，重点关注农产品贸易政策"',
    inputFormats: '文本指令、报告类型选择',
    outputItems: ['结构化日报/周报', '风险定级矩阵', '可视化图表', 'PDF/Word格式导出'],
    trialResponse: '已生成《供应链政策舆情周报（2026第12周）》\n\n一、本周重点政策：\n1. 商务部优化农产品进口流程（影响等级：中）\n2. 巴西延长大豆出口税减免（影响等级：高）\n3. 澳洲铁矿石出口审查新规征求意见（影响等级：低）\n\n二、舆情热点：\n1. 中美贸易谈判进展积极（情绪：正面）\n2. 全球粮食安全会议召开（情绪：中性）\n\n三、风险矩阵：\n- 高风险事件：0件\n- 中风险事件：2件\n- 低风险事件：5件\n\n报告包含8张分析图表，可导出PDF',
  },
};

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════
export function AgentDetailPage({ userMode }: AgentDetailPageProps) {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const agent = mockAgents.find((a) => a.id === agentId);
  const detail = agentId ? AGENT_DETAILS[agentId] : undefined;

  const [showTrial, setShowTrial] = useState(false);
  const [trialInput, setTrialInput] = useState('');
  const [trialMessages, setTrialMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [trialLoading, setTrialLoading] = useState(false);
  const [installed, setInstalled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [trialMessages]);

  const handleTrial = () => {
    if (!trialInput.trim() || trialLoading) return;
    const userMsg = trialInput.trim();
    setTrialMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setTrialInput('');
    setTrialLoading(true);
    setTimeout(() => {
      setTrialMessages(prev => [...prev, {
        role: 'assistant',
        content: detail?.trialResponse || `基于「${agent?.name}」的分析结果：\n\n已对您的输入进行处理，识别到关键信号，分析报告生成中...`,
      }]);
      setTrialLoading(false);
    }, 1500);
  };

  const copyCode = (code: string) => { navigator.clipboard.writeText(code); };

  if (!agent) {
    return (
      <div className="px-8 pt-6 pb-8">
        <div className="bg-white/70 backdrop-blur-xl rounded-xl p-12 text-center border border-[#e2e8f0]">
          <div className="w-14 h-14 rounded-full bg-[#edf1f8] flex items-center justify-center mx-auto mb-4">
            <Bot className="w-6 h-6 text-[#a3b1c6]" />
          </div>
          <h2 className="text-[18px] text-[#0d1b2a] mb-2" style={{ fontWeight: 500 }}>智能体不存在</h2>
          <p className="text-sm text-[#7d8da1] mb-6">该智能体可能已被删除或您无权访问</p>
          <button onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0d1b2a] text-white text-sm hover:bg-[#1b2d45] transition-colors">
            <ArrowLeft className="w-4 h-4" />返回
          </button>
        </div>
      </div>
    );
  }

  const Icon = getAgentIcon(agent.name);

  // 智能体 web 服务地址（来自 Excel「3月基地评估」）
  const TRIAL_URLS: Record<string, string> = {
    '3':  'https://hiagent.xmschain.com/product/llm/chat/d6gm8rcl59d9ouc7earg',       // 粮食产量预测
    '4':  'https://hiagent.xmschain.com/product/llm/chat/d63i0bsl59d9ouc74jv0',       // 粮食价格预测
    '6':  'https://hiagent.xmschain.com/product/llm/chat/d66im48svobk8pp4irng',       // 库存智能分析
    '9':  'https://ironstone.app.xmschain.com/web/agent-app/chat/1925',               // 价格预测(铁矿石)
    '10': 'https://ironstone.app.xmschain.com/web/agent-app/chat/1886',               // 供应分析
    '11': 'https://ironstone.app.xmschain.com/web/agent-app/chat/1884',               // 供需平衡
    'draft-3': 'https://ironstone.app.xmschain.com/web/agent-app/chat/1697',          // 需求分析
  };
  const trialUrl = agentId ? TRIAL_URLS[agentId] : undefined;
  const hasTrialUrl = !!trialUrl;

  return (
    <div className="px-8 pt-6 pb-8">
      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-[#7d8da1] hover:text-[#0d1b2a] transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />返回上一页
      </button>

      {/* Header card */}
      <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-[#0d1b2a]/[0.06] flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-[#0d1b2a]" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-[22px] text-[#0d1b2a]" style={{ fontWeight: 500 }}>{agent.name}</h1>
                  <span className="px-2 py-0.5 bg-[#edf1f8] text-[#4a5b73] rounded-md text-xs">{agent.version}</span>
                  <span className={`px-2 py-0.5 rounded-md text-xs ${agent.status === 'normal' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#f59e0b]/10 text-[#f59e0b]'}`} style={{ fontWeight: 500 }}>
                    {agent.status === 'normal' ? '正常' : '待升级'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[#7d8da1] ml-14">
              <div className="w-6 h-6 rounded-full bg-[#0d1b2a]/10 flex items-center justify-center text-[#0d1b2a] text-xs">
                {agent.creator.name[0]}
              </div>
              <span className="text-sm">创建者: {agent.creator.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                if (hasTrialUrl) {
                  window.open(trialUrl, '_blank', 'noopener');
                }
              }}
              disabled={!hasTrialUrl}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm transition-all border ${
                !hasTrialUrl
                  ? 'border-[#e2e8f0] text-[#c9cdd4] bg-[#f8f9fa] cursor-not-allowed'
                  : 'border-[#e2e8f0] text-[#4a5b73] hover:bg-[#f4f6fa]'
              }`}
              style={{ fontWeight: 500 }}
              title={!hasTrialUrl ? '暂无试用地址' : '打开试用页面'}>
              <Play className="w-3.5 h-3.5" />试用
            </button>
            <button onClick={() => setInstalled(prev => !prev)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm transition-all ${installed ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' : 'bg-[#0d1b2a] text-white hover:bg-[#1b2d45]'}`}
              style={{ fontWeight: 500 }}>
              {installed ? <><CheckCircle2 className="w-3.5 h-3.5" />已安装</> : <><Package className="w-3.5 h-3.5" />安装</>}
            </button>
          </div>
        </div>
      </div>

      {/* Body: 2-col layout */}
      <div className="grid grid-cols-3 gap-5">
        {/* Left: rich content */}
        <div className="col-span-2 space-y-5">
          {/* 功能介绍 */}
          <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] p-6">
            <h2 className="text-[15px] text-[#0d1b2a] mb-4" style={{ fontWeight: 500 }}>功能介绍</h2>
            <p className="text-sm text-[#7d8da1] mb-4 leading-relaxed">{agent.description}</p>
            <div className="bg-[#0d1b2a]/[0.03] border border-[#e2e8f0] rounded-lg p-4">
              <h3 className="text-sm text-[#0d1b2a] mb-2" style={{ fontWeight: 500 }}>核心能力</h3>
              <ul className="text-sm text-[#4a5b73] space-y-1.5">
                {(detail?.capabilities || [
                  '多源供应链数据自动采集与融合',
                  '基于AI模型进行预测分析与风险评估',
                  '自动生成结构化分析报告与预警信号',
                ]).map((cap, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 使用场景 */}
          <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] p-6">
            <h2 className="text-[15px] text-[#0d1b2a] mb-4" style={{ fontWeight: 500 }}>使用场景</h2>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {agent.tags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 bg-[#f4f6fa] text-[#4a5b73] text-xs rounded-md border border-[#edf1f8]">{tag}</span>
              ))}
            </div>
            <div className="space-y-3">
              {(detail?.scenarios || [
                { title: '大宗商品价格趋势研判', desc: '融合多源数据预测大豆、铁矿石等品种价格走势' },
                { title: '供应链风险预警', desc: '实时监控物流、信用、气象等风险因子，自动触发预警' },
              ]).map((s, i) => (
                <div key={i} className="p-4 bg-[#f8f9fc] rounded-lg border border-[#edf1f8]">
                  <h3 className="text-sm text-[#0d1b2a] mb-1" style={{ fontWeight: 500 }}>{s.title}</h3>
                  <p className="text-sm text-[#7d8da1]">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 输入/输出 */}
          <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] p-6">
            <h2 className="text-[15px] text-[#0d1b2a] mb-4" style={{ fontWeight: 500 }}>输入/输出说明</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-[#0d1b2a] mb-2" style={{ fontWeight: 500 }}>输入示例</h3>
                <div className="bg-[#f8f9fc] rounded-lg p-4 border border-[#edf1f8]">
                  <p className="text-sm text-[#4a5b73] mb-2">文本输入：</p>
                  <code className="text-xs text-[#7d8da1]">{detail?.inputExample || '"请对当前供应链风险进行综合分析"'}</code>
                  <p className="text-sm text-[#4a5b73] mt-3 mb-2">支持数据格式：</p>
                  <span className="text-xs text-[#7d8da1]">{detail?.inputFormats || 'CSV, Excel, JSON, API接口'}</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm text-[#0d1b2a] mb-2" style={{ fontWeight: 500 }}>输出示例</h3>
                <div className="bg-[#f8f9fc] rounded-lg p-4 border border-[#edf1f8]">
                  <p className="text-sm text-[#4a5b73]">生成结构化分析报告，包括：</p>
                  <ul className="text-xs text-[#7d8da1] mt-2 space-y-1">
                    {(detail?.outputItems || [
                      '预测/分析结果',
                      '风险因子识别与评级',
                      '策略建议与应对方案',
                    ]).map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 业务指标 & 算法 */}
          {(detail?.businessKpi || detail?.algorithms) && (
            <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] p-6">
              <h2 className="text-[15px] text-[#0d1b2a] mb-4" style={{ fontWeight: 500 }}>技术规格</h2>
              <div className="space-y-3">
                {detail?.businessKpi && (
                  <div className="flex items-center justify-between p-4 bg-[#10B981]/[0.04] rounded-lg border border-[#10B981]/10">
                    <div>
                      <span className="text-xs text-[#7d8da1]">核心业务指标</span>
                      <p className="text-sm text-[#0d1b2a] mt-0.5" style={{ fontWeight: 500 }}>{detail.businessKpi.metric}</p>
                    </div>
                    <span className="text-lg text-[#10B981] tabular-nums" style={{ fontWeight: 600 }}>{detail.businessKpi.target}</span>
                  </div>
                )}
                {detail?.algorithms && detail.algorithms.length > 0 && (
                  <div className="p-4 bg-[#f8f9fc] rounded-lg border border-[#edf1f8]">
                    <span className="text-xs text-[#7d8da1]">核心算法</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {detail.algorithms.map((alg, i) => (
                        <span key={i} className="px-2.5 py-1 bg-[#0d1b2a]/[0.06] text-[#0d1b2a] text-xs rounded-md">{alg}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 版本历史 */}
          <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] p-6">
            <h2 className="text-[15px] text-[#0d1b2a] mb-4" style={{ fontWeight: 500 }}>版本历史</h2>
            <div className="space-y-3">
              <div className="flex gap-4">
                <span className="px-2 py-0.5 bg-[#0d1b2a] text-white rounded-md text-xs h-fit" style={{ fontWeight: 500 }}>{agent.version}</span>
                <div className="flex-1">
                  <p className="text-sm text-[#4a5b73] mb-1">当前版本，优化模型准确率与响应速度</p>
                  <span className="text-xs text-[#a3b1c6]">{agent.publishDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: sidebar */}
        <div className="space-y-5">
          {agent.models?.length > 0 && (
            <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] px-5 py-5">
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="w-4 h-4 text-[#7d8da1]" />
                <span className="text-sm text-[#0d1b2a]" style={{ fontWeight: 500 }}>行业模型</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {agent.models.map((m: string) => (
                  <span key={m} className="px-3 py-1.5 bg-[#edf1f8] text-[#4a5b73] text-xs rounded-lg">{m}</span>
                ))}
              </div>
            </div>
          )}

          {agent.tools?.length > 0 && (
            <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] px-5 py-5">
              <div className="flex items-center gap-2 mb-3">
                <Wrench className="w-4 h-4 text-[#7d8da1]" />
                <span className="text-sm text-[#0d1b2a]" style={{ fontWeight: 500 }}>工具</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {agent.tools.map((t: string) => (
                  <span key={t} className="px-3 py-1.5 bg-[#edf1f8] text-[#4a5b73] text-xs rounded-lg">{t}</span>
                ))}
              </div>
            </div>
          )}

          {(agent.successRate !== undefined || agent.callCount !== undefined) && (
            <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] px-5 py-5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-[#7d8da1]" />
                <span className="text-sm text-[#0d1b2a]" style={{ fontWeight: 500 }}>运行指标</span>
              </div>
              <div className="space-y-2.5">
                {agent.successRate !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#7d8da1]">成功率</span>
                    <span className={`text-sm tabular-nums ${agent.successRate < 95 ? 'text-[#c7000b]' : 'text-[#0d1b2a]'}`} style={{ fontWeight: 500 }}>{agent.successRate}%</span>
                  </div>
                )}
                {agent.callCount !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#7d8da1]">调用次数</span>
                    <span className="text-sm text-[#0d1b2a] tabular-nums" style={{ fontWeight: 500 }}>{agent.callCount.toLocaleString()}</span>
                  </div>
                )}
                {agent.subAgentCount !== undefined && agent.subAgentCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#7d8da1]">子智能体</span>
                    <span className="text-sm text-[#0d1b2a] tabular-nums" style={{ fontWeight: 500 }}>{agent.subAgentCount}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-[#e2e8f0] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] text-[#0d1b2a]" style={{ fontWeight: 500 }}>开发者接入</h2>
              <Code2 className="w-4 h-4 text-[#a3b1c6]" />
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-[#0d1b2a] mb-2" style={{ fontWeight: 500 }}>API 调用示例</h3>
                <div className="relative">
                  <pre className="bg-[#0d1b2a] text-[#e2e8f0] p-3.5 rounded-lg text-[11px] overflow-x-auto scrollbar-subtle">
{`POST /api/v1/agents/${agent.id}/run
{
  "input": "${detail?.inputExample?.replace(/"/g, '') || '请分析...'}",
  "params": { "temperature": 0.7 }
}`}
                  </pre>
                  <button onClick={() => copyCode(`POST /api/v1/agents/${agent.id}/run`)}
                    className="absolute top-2 right-2 p-1.5 hover:bg-white/10 rounded transition-colors">
                    <Copy className="w-3 h-3 text-[#7d8da1]" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <button className="w-full px-4 py-2.5 bg-[#0d1b2a]/[0.04] text-[#0d1b2a] rounded-lg hover:bg-[#0d1b2a]/[0.08] flex items-center justify-center gap-2 text-sm transition-colors border border-[#e2e8f0]">
                  <BookOpen className="w-4 h-4" />查看完整开发者文档
                </button>
                <button className="w-full px-4 py-2.5 bg-[#f8f9fc] text-[#4a5b73] rounded-lg hover:bg-[#edf1f8] flex items-center justify-center gap-2 text-sm transition-colors border border-[#edf1f8]">
                  <Download className="w-4 h-4" />下载 SDK
                </button>
              </div>
            </div>
          </div>

          {agent.status === 'upgrade' && (
            <div className="bg-[#f59e0b]/[0.06] border border-[#f59e0b]/20 rounded-xl p-5">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-[#f59e0b] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm text-[#0d1b2a] mb-1" style={{ fontWeight: 500 }}>待升级提示</h3>
                  <p className="text-sm text-[#7d8da1]">该智能体的模型版本相对落后，建议升级以获得更好的性能表现。</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trial slide-in panel */}
      {showTrial && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowTrial(false)} />
          <div className="relative w-[420px] h-full bg-white/95 backdrop-blur-xl border-l border-[#e2e8f0] flex flex-col shadow-2xl">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0d1b2a]" />
                <span className="text-sm text-[#0d1b2a]" style={{ fontWeight: 500 }}>试用 · {agent.name}</span>
              </div>
              <button onClick={() => setShowTrial(false)} className="p-1 hover:bg-[#edf1f8] rounded-lg transition-colors">
                <X className="w-4 h-4 text-[#7d8da1]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-subtle">
              {trialMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Bot className="w-10 h-10 text-[#a3b1c6] mb-3" />
                  <p className="text-sm text-[#7d8da1] mb-1">发送消息开始试用</p>
                  <p className="text-xs text-[#a3b1c6]">例如：{detail?.inputExample?.replace(/"/g, '').substring(0, 30) || '输入您的问题'}...</p>
                </div>
              )}
              {trialMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-xl text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-[#0d1b2a] text-white' : 'bg-[#f4f6fa] text-[#4a5b73] border border-[#edf1f8]'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {trialLoading && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-xl bg-[#f4f6fa] border border-[#edf1f8]">
                    <Loader2 className="w-4 h-4 text-[#7d8da1] animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="px-5 py-4 border-t border-[#e2e8f0] flex-shrink-0">
              <div className="flex items-center gap-2">
                <input type="text" value={trialInput} onChange={(e) => setTrialInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTrial()}
                  placeholder="输入您的问题..."
                  className="flex-1 px-4 py-2.5 border border-[#e2e8f0] rounded-lg text-sm text-[#0d1b2a] placeholder-[#a3b1c6] focus:outline-none focus:ring-1 focus:ring-[#0d1b2a]/20 bg-white/70" />
                <button onClick={handleTrial} disabled={!trialInput.trim() || trialLoading}
                  className="p-2.5 bg-[#0d1b2a] text-white rounded-lg hover:bg-[#1b2d45] disabled:opacity-40 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
