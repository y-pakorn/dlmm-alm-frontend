const BASE_URL = 'http://localhost:3000';

async function runLiquidityManager() {
  try {
    const response = await fetch(`${BASE_URL}/api/alm`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Liquidity manager run result:', result);
  } catch (error) {
    console.error('Error running liquidity manager:', error);
  }
}

// Run immediately and then every 5 minutes
runLiquidityManager();
setInterval(runLiquidityManager, 5 * 60 * 1000);

console.log('Local cron job started. Press Ctrl+C to exit.');