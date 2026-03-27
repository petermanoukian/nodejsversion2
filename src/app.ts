import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import flash from 'connect-flash';
import expressLayouts from 'express-ejs-layouts';
import apiRouter from './routes/index';
import ejsMate from 'ejs-mate';


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());

// 1. Session first (required for flash)
app.use(session({
  secret: 'NuRTter76NudeJSe5r', // ← change to secure random in production
  resave: false,
  saveUninitialized: false,      // ← better default (false prevents empty sessions)
  cookie: { secure: false }      // true in production with HTTPS
}));

// 2. Flash after session
app.use(flash());

// 3. Expose flash + extras to views — do this ONCE, right after flash()
app.use((req, res, next) => {
  // Consume flash values only when needed — but expose them safely
  res.locals.success  = req.flash('success');
  res.locals.error    = req.flash('error');
    const fieldErrorsRaw = req.flash('fieldErrors');
    //console.log('FIELD ERRORS RAW:', fieldErrorsRaw);
    res.locals.fieldErrors = JSON.parse(fieldErrorsRaw[0] || '[]');
    //console.log('FIELD ERRORS PARSED:', res.locals.fieldErrors);

  // oldInput usually stored as object → take first if array
  const old = req.flash('oldInput');
  res.locals.oldInput = old.length > 0 ? old[0] : {};

  res.locals.currentPath = req.path;

  next();
});

// EJS + layouts
/*
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout/main');
app.set('views', path.join(__dirname, 'views'));*/

// EJS + layouts
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parsers & static
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// 4. Routes
app.use('/', apiRouter);

// 5. Global error handler – LAST middleware – catches async crashes
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error caught:', err.stack || err);
  req.flash('error', err.message || 'Something went wrong. Please try again.');
  res.status(500).redirect('back'); // or fixed path '/superadmin/cats/view'
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});