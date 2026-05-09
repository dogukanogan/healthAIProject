const app = require('./app');
const sequelize = require('./config/database');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    // Test DB connection
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection established.');

    // Sync models (creates tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized.');

    // Run seed if env var is set
    if (process.env.RUN_SEED === 'true') {
      try {
        const seed = require('./seed');
        await seed();
        console.log('✅ Seed completed.');
      } catch (seedErr) {
        console.warn('⚠️ Seed skipped (data may already exist):', seedErr.message);
      }
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error.message);
    process.exit(1);
  }
})();
