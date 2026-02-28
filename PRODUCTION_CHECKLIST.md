# Production Deployment Checklist

## 🔒 Security

### Backend Security
- [ ] Change default admin password
- [ ] Generate new `ADMIN_PASSWORD_HASH` with strong password
- [ ] Use production MongoDB URL with authentication
- [ ] Enable MongoDB SSL/TLS connection
- [ ] Set production `CORS_ORIGINS` (no wildcards)
- [ ] Use production payment gateway keys (not test keys)
- [ ] Enable HTTPS for all endpoints
- [ ] Set `secure=True` for cookies in production
- [ ] Implement rate limiting on APIs
- [ ] Add request validation and sanitization
- [ ] Enable API authentication for all protected routes
- [ ] Set up proper error logging (don't expose stack traces)
- [ ] Review and restrict database user permissions

### Frontend Security
- [ ] Update `REACT_APP_BACKEND_URL` to production API URL
- [ ] Remove console.log statements
- [ ] Enable Content Security Policy (CSP)
- [ ] Implement CSRF protection
- [ ] Add security headers (X-Frame-Options, X-Content-Type-Options)
- [ ] Validate all user inputs on frontend
- [ ] Sanitize HTML content

---

## ⚙️ Configuration

### Environment Variables
- [ ] Set `NODE_ENV=production` for frontend
- [ ] Configure production database URL
- [ ] Set up production email service (for notifications)
- [ ] Configure CDN for static assets
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure analytics (Google Analytics, etc.)
- [ ] Set up monitoring and alerting

### Database
- [ ] Create database indexes for performance
- [ ] Set up automated backups (daily/hourly)
- [ ] Test backup restoration process
- [ ] Configure replication for high availability
- [ ] Set up database monitoring
- [ ] Implement data retention policies

---

## 🚀 Performance

### Backend Optimization
- [ ] Enable gzip compression
- [ ] Implement caching strategy (Redis)
- [ ] Optimize database queries
- [ ] Add database connection pooling
- [ ] Set up load balancing
- [ ] Configure worker processes (Gunicorn/Uvicorn)
- [ ] Implement API response pagination
- [ ] Add query result caching

### Frontend Optimization
- [ ] Minify and bundle JavaScript
- [ ] Optimize images (use WebP format)
- [ ] Implement lazy loading for images
- [ ] Enable code splitting
- [ ] Add service worker for PWA
- [ ] Optimize font loading
- [ ] Reduce bundle size (analyze with webpack-bundle-analyzer)
- [ ] Enable browser caching
- [ ] Use CDN for static assets

---

## 📧 Email & Notifications

- [ ] Set up email service (SendGrid, AWS SES)
- [ ] Configure order confirmation emails
- [ ] Set up order status update emails
- [ ] Configure admin notification emails
- [ ] Add email templates with branding
- [ ] Test email deliverability
- [ ] Set up SMS notifications (optional)

---

## 💳 Payment Gateway

### Razorpay Production Setup
- [ ] Create production Razorpay account
- [ ] Complete KYC verification
- [ ] Get production API keys
- [ ] Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- [ ] Configure webhook URL in Razorpay dashboard
- [ ] Set up webhook secret
- [ ] Test payment flow in production
- [ ] Verify payment capture and refund flows
- [ ] Set up payment reconciliation

### Stripe (If using Stripe)
- [ ] Activate Stripe account
- [ ] Complete business verification
- [ ] Get production API keys
- [ ] Configure webhook endpoints
- [ ] Test payment flows

---

## 🧪 Testing

- [ ] Run all unit tests
- [ ] Run integration tests
- [ ] Perform end-to-end testing
- [ ] Test payment flows with real cards
- [ ] Test on multiple devices (mobile, tablet, desktop)
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Perform load testing
- [ ] Test database backup/restore
- [ ] Verify email notifications
- [ ] Test error scenarios

---

## 📊 Monitoring & Analytics

- [ ] Set up application monitoring (New Relic, Datadog)
- [ ] Configure error tracking (Sentry)
- [ ] Set up uptime monitoring (Pingdom, UptimeRobot)
- [ ] Add Google Analytics or similar
- [ ] Set up server logs aggregation
- [ ] Configure alerts for critical errors
- [ ] Monitor database performance
- [ ] Track payment success/failure rates
- [ ] Monitor API response times

---

## 🌐 Domain & Hosting

- [ ] Purchase domain name
- [ ] Configure DNS records
- [ ] Set up SSL certificate (Let's Encrypt, etc.)
- [ ] Configure CDN (Cloudflare, AWS CloudFront)
- [ ] Set up web server (Nginx, Apache)
- [ ] Configure reverse proxy
- [ ] Test SSL/HTTPS configuration
- [ ] Set up subdomain for admin panel (optional)

---

## 📱 Mobile & PWA

- [ ] Test responsive design on all devices
- [ ] Configure PWA manifest
- [ ] Add app icons (all sizes)
- [ ] Test offline functionality
- [ ] Optimize for mobile performance
- [ ] Test touch interactions

---

## 📝 Documentation

- [ ] Update README with production setup
- [ ] Document API endpoints
- [ ] Create admin user guide
- [ ] Document deployment process
- [ ] Create runbook for common issues
- [ ] Document disaster recovery process

---

## 🔄 Continuous Integration/Deployment

- [ ] Set up CI/CD pipeline (GitHub Actions, GitLab CI)
- [ ] Configure automated testing
- [ ] Set up staging environment
- [ ] Configure automated deployment
- [ ] Implement rollback strategy
- [ ] Set up database migration strategy

---

## 📜 Legal & Compliance

- [ ] Add Terms of Service
- [ ] Add Privacy Policy
- [ ] Add Refund/Return Policy
- [ ] Add Shipping Policy
- [ ] Implement GDPR compliance (if applicable)
- [ ] Add cookie consent banner
- [ ] Add PCI DSS compliance for payments
- [ ] Display business registration details

---

## 🎯 Post-Launch

- [ ] Monitor error rates
- [ ] Track user behavior
- [ ] Collect user feedback
- [ ] Monitor conversion rates
- [ ] Track page load times
- [ ] Review security logs
- [ ] Perform regular backups verification
- [ ] Update dependencies regularly
- [ ] Review and optimize based on analytics

---

## 🔥 Quick Production Commands

### Generate New Admin Password Hash
```bash
python -c "import bcrypt; print(bcrypt.hashpw(b'YOUR_SECURE_PASSWORD', bcrypt.gensalt()).decode())"
```

### Production Build
```bash
# Frontend
cd frontend
yarn build

# Backend (with Gunicorn)
cd backend
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

### Database Backup (Automated)
```bash
# Add to crontab for daily backup at 2 AM
0 2 * * * /usr/bin/python3 /path/to/app/scripts/backup_db.py
```

---

**Remember:** Test everything thoroughly in a staging environment before going live!

**Production Readiness Score:** Check off all items above before launching 🚀