/* 热榜数据源清单（与界面分离，方便增删平台）
   字段：id / cat / name / char / color / sub / home / cid / api / nohot
   cid  = codelife 榜单 ID（主力源，直连可用、带 CORS）
   api  = 'hn' | 'devto' 走官方接口（两者都带 CORS）
   nohot= 热度值无意义时不显示 */
window.HOT_CATS = [
  { id: 'hot',    name: '综合热搜', en: 'TRENDING' },
  { id: 'tech',   name: '科技开发', en: 'TECH & DEV' },
  { id: 'global', name: '海外视野', en: 'GLOBAL' },
  { id: 'news',   name: '新闻资讯', en: 'NEWS' },
  { id: 'fun',    name: '影音娱乐', en: 'ENTERTAINMENT' },
];
window.HOT_SOURCES = [
  { id:'weibo',      cat:'hot',    name:'微博热搜',     char:'微', color:'#e6162d', sub:'随时随地发现新鲜事', home:'https://s.weibo.com/top/summary', cid:'KqndgxeLl9' },
  { id:'zhihu',      cat:'hot',    name:'知乎热榜',     char:'知', color:'#0084ff', sub:'有问题 就会有答案',  home:'https://www.zhihu.com/hot',      cid:'mproPpoq6O' },
  { id:'baidu',      cat:'hot',    name:'百度热点',     char:'百', color:'#2932e1', sub:'实时热点榜',        home:'https://top.baidu.com/board?tab=realtime', cid:'Jb0vmloB1G' },
  { id:'toutiao',    cat:'hot',    name:'头条热榜',     char:'头', color:'#f85959', sub:'信息创造价值',      home:'https://www.toutiao.com/',       cid:'toutiao' },
  { id:'wechat',     cat:'hot',    name:'微信热文',     char:'信', color:'#07c160', sub:'24h 热门公众号文章', home:'https://weixin.qq.com/',         cid:'WnBe01o371' },
  { id:'smzdm',      cat:'hot',    name:'什么值得买',   char:'值', color:'#e02727', sub:'好文 · 好价榜',      home:'https://www.smzdm.com/',         cid:'K7GdagpoQy' },
  { id:'tieba',      cat:'hot',    name:'百度贴吧',     char:'贴', color:'#3385ff', sub:'热议话题榜',        home:'https://tieba.baidu.com/',       cid:'Om4ejxvxEN' },

  { id:'github',     cat:'tech',   name:'GitHub 趋势',  char:'G',  color:'#24292f', sub:'Trending Today',   home:'https://github.com/trending',    cid:'rYqoXQ8vOD' },
  { id:'juejin',     cat:'tech',   name:'掘金',         char:'掘', color:'#1e80ff', sub:'本周最热技术文章',   home:'https://juejin.cn/hot',          cid:'QaqeEaVe9R' },
  { id:'sspai',      cat:'tech',   name:'少数派',       char:'少', color:'#d71a1b', sub:'高质量数字消费指南', home:'https://sspai.com/',             cid:'Y2KeDGQdNP' },
  { id:'ithome',     cat:'tech',   name:'IT之家',       char:'IT', color:'#c40000', sub:'科技资讯日榜',      home:'https://www.ithome.com/',        cid:'74Kvx59dkx' },
  { id:'kr36',       cat:'tech',   name:'36氪',         char:'36', color:'#4285f4', sub:'24 小时热榜',       home:'https://36kr.com/hot-list/catalog', cid:'Q1Vd5Ko85R' },
  { id:'csdn',       cat:'tech',   name:'CSDN',         char:'C',  color:'#fc5531', sub:'技术博客热榜',      home:'https://blog.csdn.net/rank/list', cid:'DgeyrgMoZq' },
  { id:'zcool',      cat:'tech',   name:'站酷',         char:'酷', color:'#e60e0e', sub:'设计创意精选',      home:'https://www.zcool.com.cn/discover', cid:'VaobJ88oAj' },

  { id:'hn',         cat:'global', name:'Hacker News',  char:'HN', color:'#ff6600', sub:'Tech & Startup',   home:'https://news.ycombinator.com/',  api:'hn' },
  { id:'devto',      cat:'global', name:'dev.to',       char:'dev', color:'#0a0a0a', sub:'Developer Community', home:'https://dev.to/',             api:'devto' },
  { id:'phunt',      cat:'global', name:'Product Hunt', char:'P',  color:'#da552f', sub:'每天发现新产品',     home:'https://www.producthunt.com/',   cid:'LBwdG0jePx' },
  { id:'appstore',   cat:'global', name:'App Store',    char:'A',  color:'#0d96f6', sub:'免费 App 榜',       home:'https://apps.apple.com/cn/charts', cid:'4anopWBelZ' },

  { id:'txnews',     cat:'news',   name:'腾讯新闻',     char:'腾', color:'#1c61b0', sub:'热问榜',            home:'https://news.qq.com/',           cid:'12owgX0oNV' },
  { id:'sina',       cat:'news',   name:'新浪财经',     char:'新', color:'#d52b2b', sub:'财经热榜',          home:'https://finance.sina.com.cn/',   cid:'rx9ozj7oXb' },
  { id:'cbn',        cat:'news',   name:'第一财经',     char:'财', color:'#0b4da2', sub:'财经要闻',          home:'https://www.yicai.com/',         cid:'0MdKam4ow1' },
  { id:'xueqiu',     cat:'news',   name:'雪球',         char:'雪', color:'#0f5fd7', sub:'投资话题榜',        home:'https://xueqiu.com/today',       cid:'X12owXzvNV' },

  { id:'bili',       cat:'fun',    name:'哔哩哔哩',     char:'B',  color:'#fb7299', sub:'全站热门视频',      home:'https://www.bilibili.com/v/popular/all', cid:'74KvxwokxM' },
  { id:'douyin',     cat:'fun',    name:'抖音热点',     char:'抖', color:'#000000', sub:'实时热榜',          home:'https://www.douyin.com/hot',     cid:'DpQvNABoNE' },
  { id:'douban',     cat:'fun',    name:'豆瓣电影',     char:'豆', color:'#2e963b', sub:'热门电影榜',        home:'https://movie.douban.com/',      cid:'mDOvnyBoEB' },
  { id:'hupu',       cat:'fun',    name:'虎扑步行街',   char:'虎', color:'#c01e2e', sub:'热帖榜',            home:'https://bbs.hupu.com/topic-hot', cid:'G47o8weMmN' },
  { id:'weread',     cat:'fun',    name:'微信读书',     char:'读', color:'#1aad19', sub:'飙升榜',            home:'https://weread.qq.com/',         cid:'4KvxEX0dkx' },
  { id:'dongqiudi',  cat:'fun',    name:'懂球帝',       char:'球', color:'#1f8b4c', sub:'足球热点',          home:'https://www.dongqiudi.com/',     cid:'n3moBE1eN5' },
];
