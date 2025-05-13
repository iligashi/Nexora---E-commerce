import {
  sendReviewApprovedEmail,
  sendReviewRejectedEmail,
  sendReviewSubmittedEmail,
  sendReviewReportedEmail,
} from "@/lib/email/sendEmail";

async function testEmails() {
  const testData = {
    userName: "John Doe",
    productName: "Wireless Headphones Pro",
    reviewContent: "These headphones are amazing! The sound quality is crystal clear and the battery life is exceptional. I would highly recommend them to anyone looking for premium wireless headphones.",
    moderatorResponse: "Your review contains promotional content that violates our guidelines.",
    reportReason: "This review appears to be spam or contains inappropriate content.",
  };

  try {
    console.log("Sending test emails...");

    // Test Review Submitted Email
    await sendReviewSubmittedEmail({
      userName: testData.userName,
      productName: testData.productName,
      reviewContent: testData.reviewContent,
    });
    console.log("✓ Review Submitted email sent");

    // Test Review Approved Email
    await sendReviewApprovedEmail({
      userName: testData.userName,
      productName: testData.productName,
      reviewContent: testData.reviewContent,
    });
    console.log("✓ Review Approved email sent");

    // Test Review Rejected Email
    await sendReviewRejectedEmail({
      userName: testData.userName,
      productName: testData.productName,
      reviewContent: testData.reviewContent,
      moderatorResponse: testData.moderatorResponse,
    });
    console.log("✓ Review Rejected email sent");

    // Test Review Reported Email
    await sendReviewReportedEmail({
      userName: testData.userName,
      productName: testData.productName,
      reviewContent: testData.reviewContent,
      reportReason: testData.reportReason,
    });
    console.log("✓ Review Reported email sent");

    console.log("All test emails sent successfully!");
  } catch (error) {
    console.error("Error sending test emails:", error);
  }
}

testEmails(); 