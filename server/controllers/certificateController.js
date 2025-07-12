
import PDFDocument from 'pdfkit';
import uniqid from 'uniqid';
import User from '../models/user.js';
import Course from '../models/course.js';
import https from 'https';

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
    const courseTitle = course.courseTitle;
    const certId = uniqid();
    const issueDate = new Date().toLocaleDateString();

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
    doc.registerFont('Heading', 'fonts/Merriweather-Bold.ttf'); // Add .ttf file locally
    doc.registerFont('Signature', 'fonts/GreatVibes-Regular.ttf'); // Add .ttf file locally
    doc.registerFont('Body', 'fonts/Merriweather-Regular.ttf');

    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${userName}_Certificate.pdf"`,
        'Content-Length': pdfData.length,
      });
      res.send(pdfData);
    });

    // 🎨 Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0f172a');

    // 🖼️ Logo
    const logoUrl = 'https://lms-portal-frontend-ten.vercel.app/assets/logo-eRVar-dC.svg';
    const loadImage = (url) =>
      new Promise((resolve, reject) => {
        https.get(url, (res) => {
          const data = [];
          res.on('data', (chunk) => data.push(chunk));
          res.on('end', () => resolve(Buffer.concat(data)));
        }).on('error', reject);
      });

    const logoBuffer = await loadImage(logoUrl);
    doc.image(logoBuffer, doc.page.width - 140, 40, { width: 100 });

    // 📝 Certificate Content
    doc
      .font('Heading')
      .fillColor('#FFD700')
      .fontSize(36)
      .text('Certificate of Completion', { align: 'center' });

    doc.moveDown();
    doc
      .font('Body')
      .fontSize(18)
      .fillColor('#FFD700')
      .text('This is to certify that', { align: 'center' });

    doc.moveDown(0.5);
    doc
      .font('Heading')
      .fontSize(28)
      .fillColor('white')
      .text(userName, { align: 'center' });

    doc.moveDown(0.5);
    doc
      .font('Body')
      .fontSize(18)
      .fillColor('#FFD700')
      .text('has successfully completed the course', { align: 'center' });

    doc.moveDown(0.2);
    doc
      .font('Heading')
      .fontSize(24)
      .fillColor('white')
      .text(courseTitle, { align: 'center' });

    doc.moveDown(1);
    doc
      .font('Body')
      .fontSize(16)
      .fillColor('#FFD700')
      .text(`Date: ${issueDate}    |    Certificate ID: ${certId}`, { align: 'center' });

    // ✍️ Signature
    doc.moveDown(3);
    doc
      .font('Signature')
      .fontSize(36)
      .fillColor('#FFD700')
      .text('Parth Agrawal', { align: 'right' });

    doc
      .font('Body')
      .fontSize(14)
      .fillColor('#FFD700')
      .text('Instructor - Edemy LMS', { align: 'right' });

    doc.end();
  } catch (error) {
    console.error('❌ Certificate generation error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
