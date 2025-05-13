import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

interface ReviewReportedEmailProps {
  userName: string;
  productName: string;
  reviewContent: string;
  reportReason: string;
}

export default function ReviewReportedEmail({
  userName,
  productName,
  reviewContent,
  reportReason,
}: ReviewReportedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your review has been reported</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Review Report Notification</Heading>
          <Text style={text}>Hi {userName},</Text>
          <Text style={text}>
            We wanted to inform you that your review for {productName} has been
            reported by a member of our community.
          </Text>
          <Text style={text}>Your review:</Text>
          <Text style={review}>{reviewContent}</Text>
          <Text style={text}>Reason for report:</Text>
          <Text style={reportBox}>{reportReason}</Text>
          <Text style={text}>
            Our moderation team will review this report and your review content.
            During this time, your review will remain visible but marked as under
            review. We'll notify you once our team has made a decision.
          </Text>
          <Text style={text}>
            If you believe this report was made in error or would like to edit your
            review, please visit your account dashboard.
          </Text>
          <Text style={footer}>
            Best regards,
            <br />
            The Nexora Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.25",
  marginBottom: "24px",
  textAlign: "center" as const,
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  marginBottom: "16px",
};

const review = {
  ...text,
  margin: "24px 0",
  padding: "16px",
  backgroundColor: "#f9fafb",
  borderRadius: "4px",
  fontStyle: "italic",
};

const reportBox = {
  ...text,
  margin: "16px 0",
  padding: "16px",
  backgroundColor: "#fee2e2",
  borderRadius: "4px",
  color: "#991b1b",
};

const footer = {
  ...text,
  color: "#6b7280",
  marginTop: "32px",
}; 