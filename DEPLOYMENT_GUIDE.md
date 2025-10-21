# 🌐 How to Deploy Your Personal Website

## Option 1: GitHub Pages (Recommended - FREE)

### Step 1: Create GitHub Repository
1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon → "New repository"
3. Name it: `yogtrivedi.github.io` (this will be your website URL)
4. Make it **Public**
5. Don't initialize with README (we already have files)
6. Click "Create repository"

### Step 2: Upload Your Files
```bash
# In your terminal, run these commands:
cd "/Users/yogtrivedi/Personal Project"

# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/yogtrivedi.github.io.git

# Push your files to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll down to "Pages" section
4. Under "Source", select "Deploy from a branch"
5. Select "main" branch and "/ (root)" folder
6. Click "Save"

### Step 4: Your Website is Live! 🎉
- **URL**: `https://yogtrivedi.github.io`
- **Update**: Just push changes to GitHub and it updates automatically
- **Free**: Completely free hosting

---

## Option 2: Netlify (Also FREE)

### Step 1: Create Netlify Account
1. Go to [Netlify.com](https://netlify.com)
2. Sign up with GitHub (recommended)
3. Connect your GitHub account

### Step 2: Deploy from GitHub
1. Click "New site from Git"
2. Choose "GitHub" as provider
3. Select your repository
4. Deploy settings:
   - Build command: (leave empty)
   - Publish directory: `/` (root)
5. Click "Deploy site"

### Step 3: Custom Domain (Optional)
- Netlify gives you a random URL like `amazing-name-123456.netlify.app`
- You can change it in Site Settings → Site Details → Change site name
- Or add a custom domain like `yogtrivedi.com`

---

## Option 3: Vercel (FREE)

### Step 1: Create Vercel Account
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository

### Step 2: Deploy
1. Click "Import Project"
2. Select your GitHub repository
3. Vercel auto-detects it's a static site
4. Click "Deploy"

### Step 3: Your Site is Live!
- **URL**: `https://your-project-name.vercel.app`
- **Custom Domain**: Add your own domain in Project Settings

---

## Option 4: Custom Domain (Professional)

### Buy a Domain
1. **Namecheap**: `yogtrivedi.com` (~$10/year)
2. **GoDaddy**: Similar pricing
3. **Google Domains**: Simple setup

### Connect to GitHub Pages
1. In your GitHub repository → Settings → Pages
2. Under "Custom domain", enter your domain
3. Add DNS records:
   - Type: `CNAME`
   - Name: `www`
   - Value: `yogtrivedi.github.io`
   - Type: `A`
   - Name: `@`
   - Value: `185.199.108.153` (GitHub's IP)

---

## 🚀 Quick Start (Recommended)

**For immediate deployment, use GitHub Pages:**

1. **Create GitHub account** (if you don't have one)
2. **Create repository** named `yogtrivedi.github.io`
3. **Upload files** using the git commands above
4. **Enable Pages** in repository settings
5. **Your site is live** at `https://yogtrivedi.github.io`

---

## 📱 Sharing Your Website

Once deployed, you can share:
- **GitHub Pages**: `https://yogtrivedi.github.io`
- **Netlify**: `https://your-site-name.netlify.app`
- **Vercel**: `https://your-project.vercel.app`

### Add to Resume/LinkedIn
- Include the URL in your resume
- Add to LinkedIn profile
- Share on social media
- Use in job applications

---

## 🔄 Updating Your Website

### GitHub Pages
```bash
# Make changes to your files
# Then run:
git add .
git commit -m "Update portfolio"
git push origin main
# Website updates automatically!
```

### Netlify/Vercel
- Changes auto-deploy when you push to GitHub
- Or drag & drop files to Netlify dashboard

---

## 🎯 Pro Tips

1. **GitHub Pages** is perfect for portfolios
2. **Netlify** has better performance and features
3. **Vercel** is great for developers
4. **Custom domain** looks more professional
5. **Always test** your site before sharing

---

## 🆘 Need Help?

- **GitHub Pages**: [docs.github.com/pages](https://docs.github.com/pages)
- **Netlify**: [docs.netlify.com](https://docs.netlify.com)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)

**Your website is ready to go live! 🚀**

