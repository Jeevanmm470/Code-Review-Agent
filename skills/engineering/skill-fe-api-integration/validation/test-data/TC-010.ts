import axios from 'axios';

export const configureClient = (tenantId: string) => {
  // Defect FAI10: Mutating shared axios defaults in-place pollutes cross-tenant requests
  axios.defaults.headers.common['X-Tenant-ID'] = tenantId;
  return axios;
};

