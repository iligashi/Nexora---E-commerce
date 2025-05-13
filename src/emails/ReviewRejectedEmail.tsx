import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

interface ReviewRejectedEmailProps {
  userName: string;
  productName: string;
  reviewContent: string;
  reason: string;
  moderatorResponse?: string;
}

export const ReviewRejectedEmail: React.FC<ReviewRejectedEmailProps> = ({
  userName,
  productName,
  reviewContent,
  reason,
  moderatorResponse,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Your review could not be approved</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Review Not Approved</Heading>
          <Text style={text}>Hi {userName},</Text>
          <Text style={text}>
            We've reviewed your submission for {productName}, but unfortunately, we
            couldn't approve it at this time.
          </Text>
          <Text style={text}>Here's what you wrote:</Text>
          <Text style={review}>{reviewContent}</Text>
          {moderatorResponse && (
            <>
              <Text style={text}>Moderator's response:</Text>
              <Text style={moderatorNote}>{moderatorResponse}</Text>
            </>
          )}
          <Text style={text}>
            Please feel free to submit a new review that follows our community
            guidelines. We value your feedback and want to ensure a helpful and
            respectful environment for all users.
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
};

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

const moderatorNote = {
  ...text,
  backgroundColor: "#fee2e2",
  padding: "16px",
  borderRadius: "4px",
  color: "#991b1b",
};

const footer = {
  ...text,
  color: "#6b7280",
  marginTop: "32px",
}; 