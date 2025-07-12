// server/controllers/certificateController.js
import puppeteer from 'puppeteer';
import uniqid from 'uniqid';
import User from '../models/user.js';
import Course from '../models/course.js';
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});


export const generateCertificate = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
      return res.status(400).json({ success: false, message: 'Missing userId or courseId' });
    }

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.status(404).json({ success: false, message: 'User or course not found' });
    }

    const userName = user.fullName || user.name || 'User';
    const courseName = course.courseTitle;
    const instructorName = 'Parth Agrawal';
    const completionDate = new Date().toLocaleDateString();
    const certId = uniqid();

    // Host your signature image publicly or use a reliable CDN
    const signatureUrl = 'https://i.ibb.co/Lhdytp89/Signature.png'; // <- replace this with your real URL
    
    const htmlContent = `
      <html>
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
          <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet">
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: 'Merriweather', serif;
              background-color: #0f172a;
              color:#FFD700;
              padding: 60px 40px;
              text-align: center;
              box-sizing: border-box;
            }
            .container {
              max-width: 900px;
              margin: auto;
              padding: 60px 40px;
              border: 12px solid #0f172a;
              background-color: #0f172a;
              box-shadow: 0 0 40px rgba(0, 0, 0, 0.08);
              border-radius: 8px;
            }
            h1 {
              font-size: 40px;
              font-weight: 700;
              text-transform: uppercase;
              margin-bottom: 12px;
            }
            .subtitle {
              font-size: 16px;
              color: #FFD700;
              margin-bottom: 25px;
            }
            .name {
              font-size: 32px;
              font-weight: 700;
              color: #FFD700;
              margin-bottom: 10px;
            }
            .course {
              font-size: 24px;
              font-weight: 700;
              margin: 10px 0 25px;
              color: #FFD700;
            }
            .date {
              font-size: 16px;
              margin-bottom: 10px;
            }
            .cert-id {
              font-size: 14px;
              color: #FFD700;
            }
            .signature {
      font-family: 'Great Vibes', cursive;
      font-size: 36px;
      color: #FFD700;
    }

    .sparkling-gold {
      background: linear-gradient(90deg, #FFD700, #fff8dc, #FFD700);
      background-size: 200% auto;
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: shine 2s linear infinite;
    }

    @keyframes shine {
      to {
        background-position: -200% center;
      }
    }

    .logo {
    color:white;
  position: absolute;
  top: 30px;        /* distance from top edge */
  right: 30px;      /* distance from right edge */
  width: 100px;     /* adjust as needed */
  height: auto;
}

            .footer {
              margin-top: 50px;
              font-size: 12px;
              color: #FFD700;
            }
          </style>
        </head>
        <body>
        <div style="position: relative; width: 100%; height: 100%;">
    <img src="https://lms-portal-frontend-ten.vercel.app/assets/logo-eRVar-dC.svg" class="logo" alt="Logo" />
          <div class="container">
            <h1>Certificate of Completion</h1>
            <div class="subtitle">This is to certify that</div>
            <div class="name">${userName}</div>
            <div class="subtitle">has successfully completed the course</div>
            <div class="course">${courseName}</div>
            <div class="date">Date: ${completionDate}</div>
            <div class="cert-id">Certificate ID: ${certId}</div>
            <div class="signature">
                <div class="signature sparkling-gold">Parth Agrawal</div>
            </div>
            <div class="footer">Issued by Edemy LMS Platform | Edemy.com</div>
          </div>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    // 📥 Force download in browser
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${userName.replace(/\s+/g, '_')}_Certificate.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    return res.send(pdfBuffer);
  } catch (err) {
    console.error('❌ Certificate generation error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
