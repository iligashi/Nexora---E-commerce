import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

interface ReviewSubmittedEmailProps {
  userName: string;
  productName: string;
  reviewContent: string;
}

export default function ReviewSubmittedEmail({
  userName,
  productName,
  reviewContent,
}: ReviewSubmittedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Thank you for your review!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Review Received</Heading>
          <Text style={text}>Hi {userName},</Text>
          <Text style={text}>
            Thank you for taking the time to review {productName}. Your review has
            been submitted successfully and is now pending moderation.
          </Text>
          <Text style={text}>Here's what you wrote:</Text>
          <Text style={review}>{reviewContent}</Text>
          <Text style={text}>
            Our moderation team will review your submission shortly. You'll receive
            another email once your review has been approved or if we need any
            additional information.
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

const footer = {
  ...text,
  color: "#6b7280",
  marginTop: "32px",
}; 