// ============================================
// COMPONENTE DATA TABLE
// Maestranza Unidos S.A.
// ============================================

/**
 * Componente de tabla de datos con búsqueda, filtros y paginación
 */
class DataTable {
    
    constructor(config) {
        this.containerId = config.containerId;
        this.data = config.data || [];
        this.columns = config.columns || [];
        this.pageSize = config.pageSize || 10;
        this.currentPage = 1;
        this.searchTerm = '';
        this.filters = config.filters || {};
        this.onRowClick = config.onRowClick || null;
        this.actions = config.actions || [];
        this.emptyMessage = config.emptyMessage || 'No hay datos para mostrar';
        
        this.init();
    }
    
    init() {
        this.render();
        this.attachEventListeners();
    }
    
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        
        const filteredData = this.getFilteredData();
        const paginatedData = this.getPaginatedData(filteredData);
        const totalPages = Math.ceil(filteredData.length / this.pageSize);
        
        container.innerHTML = `
            <div class="datatable-wrapper">
                <div class="datatable-header">
                    <div class="datatable-search">
                        <i class="fas fa-search"></i>
                        <input 
                            type="text" 
                            class="form-control" 
                            id="search_${this.containerId}" 
                            placeholder="Buscar..."
                            value="${this.searchTerm}"
                        >
                    </div>
                    <div class="datatable-actions">
                        ${this.actions.map(action => `
                            <button 
                                class="btn btn-sm ${action.class || 'btn-primary'}" 
                                onclick="${action.onclick}"
                            >
                                <i class="${action.icon} me-1"></i>
                                ${action.label}
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <div class="table-wrapper">
                    ${paginatedData.length > 0 ? this.renderTable(paginatedData) : this.renderEmpty()}
                </div>
                
                ${filteredData.length > 0 ? this.renderPagination(totalPages, filteredData.length) : ''}
            </div>
        `;
    }
    
    renderTable(data) {
        return `
            <table class="data-table">
                <thead>
                    <tr>
                        ${this.columns.map(col => `
                            <th>${col.header}</th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${data.map((row, index) => `
                        <tr ${this.onRowClick ? `onclick="dataTableInstances['${this.containerId}'].handleRowClick(${index})"` : ''} 
                            style="${this.onRowClick ? 'cursor: pointer;' : ''}">
                            ${this.columns.map(col => `
                                <td>${this.renderCell(row, col)}</td>
                            `).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    renderCell(row, column) {
        if (column.render) {
            return column.render(row);
        }
        
        const value = row[column.field];
        
        if (column.type === 'badge') {
            const badgeClass = column.badgeClass ? column.badgeClass(row) : 'badge-secondary';
            return `<span class="badge ${badgeClass}">${escaparHTML(value)}</span>`;
        }
        
        if (column.type === 'currency') {
            return formatearPrecio(value);
        }
        
        if (column.type === 'number') {
            return formatearNumero(value);
        }
        
        if (column.type === 'date') {
            return formatearFecha(value);
        }
        
        if (column.type === 'datetime') {
            return formatearFechaHora(value);
        }
        
        return escaparHTML(value || '-');
    }
    
    renderEmpty() {
        return `
            <div class="empty-state">
                <i class="fas fa-inbox empty-state-icon"></i>
                <h3 class="empty-state-title">No hay datos</h3>
                <p class="empty-state-text">${this.emptyMessage}</p>
            </div>
        `;
    }
    
    renderPagination(totalPages, totalRecords) {
        if (totalPages <= 1) return '';
        
        const startRecord = (this.currentPage - 1) * this.pageSize + 1;
        const endRecord = Math.min(this.currentPage * this.pageSize, totalRecords);
        
        return `
            <div class="datatable-footer">
                <div class="datatable-info">
                    Mostrando ${startRecord} a ${endRecord} de ${totalRecords} registros
                </div>
                <div class="datatable-pagination">
                    <button 
                        class="btn btn-sm btn-outline-primary" 
                        ${this.currentPage === 1 ? 'disabled' : ''}
                        onclick="dataTableInstances['${this.containerId}'].goToPage(${this.currentPage - 1})"
                    >
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    
                    ${this.renderPageButtons(totalPages)}
                    
                    <button 
                        class="btn btn-sm btn-outline-primary" 
                        ${this.currentPage === totalPages ? 'disabled' : ''}
                        onclick="dataTableInstances['${this.containerId}'].goToPage(${this.currentPage + 1})"
                    >
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    renderPageButtons(totalPages) {
        const buttons = [];
        const maxButtons = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);
        
        if (endPage - startPage < maxButtons - 1) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            buttons.push(`
                <button 
                    class="btn btn-sm ${i === this.currentPage ? 'btn-primary' : 'btn-outline-primary'}" 
                    onclick="dataTableInstances['${this.containerId}'].goToPage(${i})"
                >
                    ${i}
                </button>
            `);
        }
        
        return buttons.join('');
    }
    
    attachEventListeners() {
        const searchInput = document.getElementById(`search_${this.containerId}`);
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                this.searchTerm = e.target.value;
                this.currentPage = 1;
                this.render();
            }, 300));
        }
    }
    
    getFilteredData() {
        let filtered = [...this.data];
        
        // Aplicar búsqueda
        if (this.searchTerm) {
            const search = this.searchTerm.toLowerCase();
            filtered = filtered.filter(row => {
                return this.columns.some(col => {
                    const value = String(row[col.field] || '').toLowerCase();
                    return value.includes(search);
                });
            });
        }
        
        // Aplicar filtros adicionales
        Object.keys(this.filters).forEach(key => {
            const filterValue = this.filters[key];
            if (filterValue) {
                filtered = filtered.filter(row => row[key] === filterValue);
            }
        });
        
        return filtered;
    }
    
    getPaginatedData(data) {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return data.slice(start, end);
    }
    
    goToPage(page) {
        this.currentPage = page;
        this.render();
        this.attachEventListeners();
    }
    
    handleRowClick(index) {
        if (this.onRowClick) {
            const filteredData = this.getFilteredData();
            const paginatedData = this.getPaginatedData(filteredData);
            this.onRowClick(paginatedData[index]);
        }
    }
    
    updateData(newData) {
        this.data = newData;
        this.currentPage = 1;
        this.render();
        this.attachEventListeners();
    }
    
    setFilters(filters) {
        this.filters = filters;
        this.currentPage = 1;
        this.render();
        this.attachEventListeners();
    }
    
    refresh() {
        this.render();
        this.attachEventListeners();
    }
}

// Almacenar instancias globalmente para acceso desde onclick
globalThis.dataTableInstances = globalThis.dataTableInstances || {};

// Estilos para DataTable
const dataTableStyles = document.createElement('style');
dataTableStyles.textContent = `
    .datatable-wrapper {
        background: var(--white);
        border-radius: var(--radius-xl);
        overflow: hidden;
    }
    
    .datatable-header {
        padding: 1rem 1.5rem;
        border-bottom: 1px solid var(--gray-200);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
    }
    
    .datatable-search {
        position: relative;
        flex: 1;
        min-width: 250px;
        max-width: 400px;
    }
    
    .datatable-search i {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--gray-500);
    }
    
    .datatable-search input {
        padding-left: 2.5rem;
    }
    
    .datatable-actions {
        display: flex;
        gap: 0.5rem;
    }
    
    .datatable-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--gray-200);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
    }
    
    .datatable-info {
        font-size: var(--font-size-sm);
        color: var(--gray-600);
    }
    
    .datatable-pagination {
        display: flex;
        gap: 0.25rem;
    }
    
    @media (max-width: 768px) {
        .datatable-header {
            flex-direction: column;
            align-items: stretch;
        }
        
        .datatable-search {
            max-width: none;
        }
        
        .datatable-actions {
            justify-content: flex-start;
        }
        
        .datatable-footer {
            flex-direction: column;
            align-items: stretch;
        }
        
        .datatable-pagination {
            justify-content: center;
        }
    }
`;

document.head.appendChild(dataTableStyles);

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataTable;
}