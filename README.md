# CV ATS Checker

A beautiful and modern web application that analyzes your CV for ATS (Applicant Tracking System) compatibility using advanced AI technology. Get instant scoring and actionable recommendations to improve your CV's ATS performance.

**🚀 Live Demo**: [https://gourav8jain.github.io/cv-ats-checker](https://gourav8jain.github.io/cv-ats-checker)

## ✨ Features

- 📄 **Multi-format Support**: Upload CVs in PDF or Word format
- 🤖 **AI-Powered Analysis**: Uses advanced AI for intelligent ATS scoring
- ⚡ **Instant Results**: No storage, immediate analysis and feedback
- 🎯 **Job-Specific Analysis**: Analyze against specific job titles and descriptions
- 💡 **Actionable Recommendations**: Get specific tips to improve your ATS score
- 🚨 **Problem Identification**: Identify issues that could hurt your ATS ranking
- 🎨 **Beautiful UI**: Modern, responsive design with glass morphism effects

## 🚀 Prerequisites

- Node.js (version 16 or higher)
- Advanced AI API key

## 🛠️ Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cv-ats-checker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_AI_API_KEY=your_ai_api_key_here
   ```

4. **Get AI API Key**
   - Go to [AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key to your `.env` file

5. **Start the development server**
   ```bash
   npm start
   ```

   The application will open at `http://localhost:3000`

## 🚀 Deployment

### **GitHub Pages (Recommended)**
The application is configured for automatic deployment to GitHub Pages:

1. **Fork/Clone** this repository
2. **Set GitHub Secret**:
   - Go to repository "Settings" > "Secrets and variables" > "Actions"
   - Create secret: `REACT_APP_AI_API_KEY`
   - Value: Your AI API key
3. **Push to main branch** - automatic deployment will start
4. **Access your app** at: `https://yourusername.github.io/cv-ats-checker`

### **Local Development**
For local development, create a `.env` file with your API key.

### **Production Build**
```bash
npm run build
```

## 📱 Usage

1. **Enter Job Details**
   - Input the job title you're applying for
   - Optionally add a link to the job description

2. **Upload Your CV**
   - Drag and drop your CV file or click to browse
   - Supported formats: PDF (.pdf), Word (.docx, .doc)

3. **Get Analysis**
   - Click "Analyze ATS Score"
   - The AI will process your CV automatically
   - Review your ATS score and recommendations

4. **Review Results**
   - **ATS Score**: 0-100 rating with color coding
   - **Issues Found**: Specific problems affecting your score
   - **Recommendations**: Actionable tips to improve

## 🔧 How It Works

The application uses advanced AI technology to:

1. **Extract text** from your uploaded CV
2. **Analyze content** against ATS best practices
3. **Score compatibility** from 0-100
4. **Identify issues** that could hurt your ranking
5. **Provide recommendations** to improve your score

## 📊 ATS Scoring Criteria

The AI analyzes your CV based on:

- **Keyword optimization** for the job title
- **Format and structure** compatibility
- **Content relevance** to the position
- **Professional presentation**
- **Industry best practices**

## 🛠️ Technologies Used

- **Frontend**: React.js with Hooks
- **Styling**: Tailwind CSS with custom glass morphism
- **AI**: Advanced AI integration
- **File Processing**: PDF-parse, Mammoth.js
- **UI Components**: Lucide React icons
- **File Upload**: React Dropzone

## 🔒 Security

- No files are stored on the server
- All processing happens in the browser
- API keys are stored in environment variables
- No personal data is logged or retained

## 🚨 Troubleshooting

**Common Issues:**

1. **API Key Error**: Ensure your AI API key is correctly set in `.env`
2. **File Upload Issues**: Check file format (PDF/Word only)
3. **Analysis Fails**: Verify internet connection and API quota

**File Size Limits:**
- PDF: Recommended under 10MB
- Word: Recommended under 5MB

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available under the MIT License.

---

**Copyright © 2024 @gourav8jain - GitHub**

**Note**: This application is for educational and personal use. Always review AI-generated recommendations and use your judgment when applying them to your CV. 