const nodemailer = require("nodemailer");

const send_Notification_mail = async ( from, to, subject, body) => {
    try {
        
       
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL, // Replace with your Gmail email address
                pass: process.env.EMAIL_PASSWORD, // Replace with your Gmail password (or use an app password)
            },
        });

        // Email options
        const mailOptions = {
            from: process.env.EMAIL, // Replace with your Gmail email address
            to: to,
            subject: subject,
            html: `
        <div style="font-family: 'Arial', sans-serif; padding: 20px; text-align: center; background-color: #f4f4f4;">
        <img src="https://beyinc.net/wp-content/uploads/2023/08/WhatsApp_Image_2023-08-02_at_11.23.51_PM__2_-removebg-preview.png" alt="Embedded Image" style="width: 100%; max-width: 400px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <p>${body}</p>
        <p style="font-size: 14px; color: #777; margin-top: 20px;">Thanks and Regards,</p>
        <p style="font-size: 16px; color: #555; font-weight: bold;">Beyinc</p>
        </div>
       `,
        };

        // Send email
        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                console.log("Internal Server Error");
            } else {
                console.log("Email sent successfully");
            }
        });
    } catch (err) {
        console.log(err);
    }
};

module.exports = send_Notification_mail