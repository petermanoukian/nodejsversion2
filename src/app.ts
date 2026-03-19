import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import flash from 'connect-flash';
import expressLayouts from 'express-ejs-layouts'; 
import apiRouter from './routes/index';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());

app.use(session({
    secret: 'NuRTter76NudeJSe5r', // Change this to a random string
    resave: false,
    saveUninitialized: true
}));
app.use(flash());

/**
 * EJS Configuration
 */
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout/main');
// Point to the views folder we will create next
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
  res.locals.currentPath = req.path;   // available in all views
  next();
});


/**
 * Middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Optional: Serve static files (CSS, Images) from a public folder
app.use(express.static(path.join(__dirname, '../public')));


app.use((req, res, next) => {
    // This makes 'error' and 'success' available to every EJS file automatically
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});



/**
 * Routes
 */
app.use('/', apiRouter);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});