/**
 * Middleware Logger
 * Mencatat setiap request HTTP yang diterima backend beserta status akhir response
 */

const loggerMiddleware = (req, res, next) => {
  const startTime = new Date();

  // res.on('finish') memastikan pencatatan dilakukan setelah response selesai dikirim
  // sehingga status code yang dicatat adalah status response akhir yang sebenarnya
  res.on('finish', () => {
    const timestamp = startTime.toISOString();

    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl} - ${res.statusCode}`
    );
  });

  next();
};

module.exports = loggerMiddleware;
