

const paginationService = {
    getPaginationParams: (query) => {
        const page = parseInt(query.page) || 1;
        const limit = Math.min(parseInt(query.limit) || 10, 100);
        const offset = (page - 1) * limit;
        
        return {
            page,
            limit,
            offset,
            search: query.search || '',
            sort: query.sort || 'id',
            order: query.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'
        };
    },

    getPagination: (page, limit) => {
        const pageNum = parseInt(page) || 1;
        const limitNum = Math.min(parseInt(limit) || 10, 100);
        const offset = (pageNum - 1) * limitNum;
        
        return {
            offset,
            limit: limitNum
        };
    },

    getOffsetLimit: (page, limit) => {
        const pageNum = parseInt(page) || 1;
        const limitNum = Math.min(parseInt(limit) || 10, 100);
        const offset = (pageNum - 1) * limitNum;
        
        return {
            offset,
            limit: limitNum
        };
    },

    getPagingData: (result, page, limit) => {
        const { count: totalCount, rows: data } = result;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const totalPages = Math.ceil(totalCount / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;
        
        return {
            totalItems: totalCount,
            data,
            totalPages,
            currentPage: pageNum,
            hasNextPage,
            hasPrevPage,
            nextPage: hasNextPage ? pageNum + 1 : null,
            prevPage: hasPrevPage ? pageNum - 1 : null
        };
    },

    getPaginationData: (totalCount, page, limit) => {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const totalPages = Math.ceil(totalCount / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;
        
        return {
            page: pageNum,
            limit: limitNum,
            totalCount,
            totalPages,
            hasNextPage,
            hasPrevPage,
            nextPage: hasNextPage ? pageNum + 1 : null,
            prevPage: hasPrevPage ? pageNum - 1 : null
        };
    },

    createPaginationMeta: (totalCount, page, limit) => {
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        
        return {
            currentPage: page,
            totalPages,
            totalCount,
            hasNextPage,
            hasPrevPage,
            nextPage: hasNextPage ? page + 1 : null,
            prevPage: hasPrevPage ? page - 1 : null,
            limit
        };
    },

    formatPaginatedResponse: (data, totalCount, page, limit) => {
        const meta = paginationService.createPaginationMeta(totalCount, page, limit);
        
        return {
            status: 'success',
            data,
            meta
        };
    },

    getSequelizePagination: (query, defaultSort = 'id') => {
        const params = paginationService.getPaginationParams(query);
        
        return {
            limit: params.limit,
            offset: params.offset,
            order: [[params.sort || defaultSort, params.order]],
            ...params
        };
    },

    buildSearchConditions: (searchTerm, searchFields) => {
        if (!searchTerm || !searchFields.length) {
            return {};
        }

        const { Op } = require('sequelize');
        
        return {
            [Op.or]: searchFields.map(field => ({
                [field]: {
                    [Op.like]: `%${searchTerm}%`
                }
            }))
        };
    },

    buildFilterConditions: (filters) => {
        const conditions = {};
        
        Object.keys(filters).forEach(key => {
            const value = filters[key];
            if (value !== undefined && value !== null && value !== '') {
                if (Array.isArray(value)) {
                    const { Op } = require('sequelize');
                    conditions[key] = { [Op.in]: value };
                } else {
                    conditions[key] = value;
                }
            }
        });
        
        return conditions;
    },

    buildWhereConditions: (searchTerm, searchFields, filters = {}) => {
        const { Op } = require('sequelize');
        const conditions = [];
        
        const searchConditions = paginationService.buildSearchConditions(searchTerm, searchFields);
        if (Object.keys(searchConditions).length > 0) {
            conditions.push(searchConditions);
        }
                
        const filterConditions = paginationService.buildFilterConditions(filters);
        if (Object.keys(filterConditions).length > 0) {
            conditions.push(filterConditions);
        }
        
        if (conditions.length === 0) return {};
        if (conditions.length === 1) return conditions[0];
        
        return { [Op.and]: conditions };
    }
};

module.exports = paginationService;