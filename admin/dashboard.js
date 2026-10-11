/* ==========================================================================
   CapFlow — admin dashboard.js
   ========================================================================== */

(function () {
  const a = window.CAPFLOW.admin;
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('ad-pending').textContent   = a.pendingBuyers;
    document.getElementById('ad-disputes').textContent  = a.openDisputes;
    document.getElementById('ad-cust').textContent      = a.customers;
    document.getElementById('ad-buyers').textContent    = a.buyers;
    document.getElementById('ad-active').textContent    = a.activeOrders;
    document.getElementById('ad-completed').textContent = a.completed;
    document.getElementById('ad-offers').textContent    = a.activeOffers;
    document.getElementById('ad-vol').textContent       = a.volume24h;
    cfRenderAdminNav('overview');
  });
})();
