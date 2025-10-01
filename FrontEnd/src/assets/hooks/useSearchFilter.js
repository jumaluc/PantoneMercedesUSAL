// hooks/useSearchFilter.js
import { useState, useMemo } from 'react';

// Función auxiliar para obtener valores de campos anidados
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
};

export const useSearchFilter = (initialData = [], searchFields = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ 
    key: null, 
    direction: 'ascending' 
  });

  // Función para filtrar y ordenar los datos
  const filteredAndSortedData = useMemo(() => {
    let filtered = initialData;

    // 1. FILTRADO por término de búsqueda
    if (searchTerm.trim()) {
      filtered = initialData.filter(item =>
        searchFields.some(field => {
          // Manejar campos anidados (ej: 'client.first_name')
          const fieldValue = field.includes('.') 
            ? getNestedValue(item, field)
            : item[field];
            
          if (fieldValue == null) return false;
          
          return fieldValue.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // 2. ORDENAMIENTO (opcional - puedes comentar si no lo necesitas)
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = getNestedValue(a, sortConfig.key);
        const bValue = getNestedValue(b, sortConfig.key);

        // Manejar valores nulos/undefined
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        // Comparar valores
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [initialData, searchTerm, sortConfig, searchFields]);

  // Función para manejar búsqueda
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Función para manejar ordenamiento
  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'ascending' 
        ? 'descending' 
        : 'ascending'
    }));
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Resetear filtros y ordenamiento
  const resetFilters = () => {
    setSearchTerm('');
    setSortConfig({ key: null, direction: 'ascending' });
  };

  return {
    filteredData: filteredAndSortedData,
    searchTerm,
    handleSearch,
    sortConfig,
    handleSort,
    clearSearch,
    resetFilters,
    totalItems: initialData.length,
    filteredCount: filteredAndSortedData.length,
    hasFilters: searchTerm.trim() !== '' || sortConfig.key !== null
  };
};