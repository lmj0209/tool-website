// 工具箱应用 - V0.1 MVP

// 应用状态
const state = {
  data: null,
  currentCategory: 'all',
  searchQuery: '',
  isLoading: true
};

// DOM 元素
const elements = {
  categories: document.getElementById('categories'),
  toolsGrid: document.getElementById('toolsGrid'),
  searchInput: document.getElementById('searchInput'),
  emptyState: document.getElementById('emptyState')
};

// 从 JSON 文件加载数据
async function loadData() {
  try {
    const response = await fetch('data/tools.json');
    if (!response.ok) {
      throw new Error('Failed to load data');
    }
    state.data = await response.json();
    state.isLoading = false;
    renderCategories();
    renderTools();
  } catch (error) {
    console.error('Error loading data:', error);
    elements.toolsGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">⚠️</div>
        <div class="empty-text">数据加载失败，请刷新页面重试</div>
      </div>
    `;
    state.isLoading = false;
  }
}

// 渲染分类按钮
function renderCategories() {
  if (!state.data || !state.data.categories) return;

  elements.categories.innerHTML = state.data.categories.map(cat => `
    <button
      class="category-btn ${cat.id === state.currentCategory ? 'active' : ''}"
      data-category="${cat.id}"
    >
      <span>${cat.icon}</span>
      <span>${cat.name}</span>
    </button>
  `).join('');

  // 绑定分类按钮事件
  elements.categories.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', handleCategoryClick);
  });
}

// 获取过滤后的工具列表
function getFilteredTools() {
  if (!state.data || !state.data.tools) return [];

  let filtered = [...state.data.tools];

  // 按分类过滤
  if (state.currentCategory !== 'all') {
    filtered = filtered.filter(tool => tool.category === state.currentCategory);
  }

  // 按搜索词过滤
  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase();
    filtered = filtered.filter(tool => {
      const nameMatch = tool.name.toLowerCase().includes(query);
      const descMatch = tool.description?.toLowerCase().includes(query);
      return nameMatch || descMatch;
    });
  }

  return filtered;
}

// 获取分类信息
function getCategoryInfo(categoryId) {
  if (!state.data || !state.data.categories) return null;
  return state.data.categories.find(cat => cat.id === categoryId);
}

// 渲染工具卡片
function renderTools() {
  const tools = getFilteredTools();

  // 显示/隐藏空状态
  if (tools.length === 0) {
    elements.toolsGrid.innerHTML = '';
    elements.emptyState.style.display = 'block';
  } else {
    elements.emptyState.style.display = 'none';
    elements.toolsGrid.innerHTML = tools.map(tool => {
      const category = getCategoryInfo(tool.category);
      return `
        <a href="${tool.url}" target="_blank" rel="noopener noreferrer" class="tool-card">
          <div class="tool-icon">${tool.icon || category?.icon || '🔧'}</div>
          <div class="tool-content">
            <h3 class="tool-title">${tool.name}</h3>
            <p class="tool-desc">${tool.description}</p>
            <span class="tool-category">${category?.icon || ''} ${category?.name || ''}</span>
          </div>
        </a>
      `;
    }).join('');
  }
}

// 处理分类点击
function handleCategoryClick(e) {
  const btn = e.currentTarget;
  const categoryId = btn.dataset.category;

  // 更新状态
  state.currentCategory = categoryId;

  // 更新按钮样式
  elements.categories.querySelectorAll('.category-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.category === categoryId);
  });

  // 重新渲染工具列表
  renderTools();
}

// 处理搜索输入
function handleSearchInput(e) {
  state.searchQuery = e.target.value.trim();
  renderTools();
}

// 初始化应用
function init() {
  // 加载数据
  loadData();

  // 绑定搜索输入事件
  elements.searchInput.addEventListener('input', handleSearchInput);

  // 添加搜索框焦点效果
  elements.searchInput.addEventListener('focus', () => {
    elements.searchInput.parentElement.style.transform = 'scale(1.02)';
  });

  elements.searchInput.addEventListener('blur', () => {
    elements.searchInput.parentElement.style.transform = 'scale(1)';
  });
}

// 页面加载完成后启动
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
