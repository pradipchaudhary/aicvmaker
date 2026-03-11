# CV Maker - Gemini AI Powered

## Simple App: Upload Passport → Extract Data → Download CV

### 🚀 Quick Start

1. **Add Gemini API Key**
   ```bash
   echo "NEXT_PUBLIC_GEMINI_API_KEY=your_key_here" > .env.local
   ```
   Get key: https://ai.google.dev/

2. **Install & Run**
   ```bash
   npm install
   npm run dev
   ```

3. **Use App**
   - Open http://localhost:3000
   - Upload passport image (JPG/PNG)
   - Gemini AI extracts data automatically
   - Edit if needed
   - Download as PDF

### 📁 Project Structure

```
app/
  ├── cv-maker.tsx      # Main app component
  ├── layout.tsx        # Layout
  └── page.tsx          # Home page
lib/
  └── passport-extractor.ts  # Gemini AI integration
public/                      # Static files
```

### 🎯 Features

✅ Upload passport image
✅ Gemini 2.0 Flash AI extraction
✅ Edit extracted data
✅ Download CV as PDF
✅ Clean, minimal UI

### 🔧 Dependencies

- **Next.js 16** - React framework
- **Gemini API** - AI extraction
- **html2pdf.js** - PDF generation
- **Lucide Icons** - UI icons
- **Tailwind CSS** - Styling

### 📱 How It Works

1. User uploads passport image
2. Image sent to Gemini 2.0 Flash API
3. AI extracts: name, passport number, dates, gender, nationality
4. User reviews and can edit
5. Download as professional PDF CV

### 💡 Tips

- Clear, well-lit passport photos work best
- Passport must be in English
- PDF download includes all extracted data
- No database - all processing in browser

---

**Status**: ✅ Production Ready
