import { Link, useParams } from 'react-router-dom';
import { Box, Button, Container, Divider, Typography } from '@mui/material';

type Policy = { title: string; sections: Array<{ heading: string; body: string }> };
const policies: Record<string, Policy> = {
  shipping: {
    title: 'Shipping & Delivery',
    sections: [
      { heading: 'Processing', body: 'Orders are prepared after they are placed. The estimated delivery date shown during checkout is an estimate and may change based on product availability, destination, and carrier service.' },
      { heading: 'Delivery details', body: 'Please provide a complete recipient name and delivery address. Customers are responsible for checking address details before placing an order. Carrier tracking information will appear in the order details when it is available.' },
      { heading: 'Delays or delivery issues', body: 'Contact support@sannidhi.com with your order reference if a parcel is delayed, marked delivered but not received, or arrives damaged.' },
    ],
  },
  returns: {
    title: 'Returns & Cancellations',
    sections: [
      { heading: 'Requesting help', body: 'Contact support@sannidhi.com with your order reference and a description of the issue. Include photographs when an item arrives damaged or incorrect.' },
      { heading: 'Personalized gifts', body: 'Items customized with names or personal messages may not be eligible for return unless they arrive damaged, defective, or materially different from the order.' },
      { heading: 'Order changes', body: 'Contact support as soon as possible to request an address change or cancellation. Requests cannot be guaranteed once preparation or dispatch has begun.' },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      { heading: 'Information collected', body: 'The store uses account, contact, delivery, order, and gift customization details to provide shopping and fulfillment services. Newsletter subscriptions are stored separately and can be removed by contacting support.' },
      { heading: 'Use and sharing', body: 'Information is used to manage accounts, fulfill orders, provide support, and maintain store operations. Delivery details may be shared with a carrier when needed to deliver an order. Passwords are stored as hashes.' },
      { heading: 'Your choices', body: 'Contact support@sannidhi.com to request access, correction, or deletion of account information, subject to records that must be retained for legal or operational reasons.' },
    ],
  },
  terms: {
    title: 'Terms of Sale',
    sections: [
      { heading: 'Orders', body: 'An order request is subject to product availability and acceptance by the store. Product details, prices, taxes, and shipping charges are shown before submission. An order reference confirms that the request was recorded; it is not a payment confirmation.' },
      { heading: 'Product details', body: 'Handmade and natural materials may vary slightly in appearance. Product descriptions and imagery are provided to represent the offered item as accurately as possible.' },
      { heading: 'Support', body: 'Questions about an order or these terms can be sent to support@sannidhi.com. These terms should be reviewed for the laws and consumer protections that apply to the store and its customers.' },
    ],
  },
};

export function StorePolicyPage() {
  const { policy = '' } = useParams();
  const content = policies[policy];
  return (
    <Box sx={{ minHeight: '70vh', bgcolor: '#FAF8F5', py: { xs: 5, md: 8 } }}>
      <Container maxWidth="md">
        {content ? <>
          <Typography variant="overline" sx={{ color: '#9a7a3e', letterSpacing: '.2em' }}>Sannidhi Collective</Typography>
          <Typography variant="h2" sx={{ fontFamily: '"Cormorant Garamond", Georgia, serif', mb: 3 }}>{content.title}</Typography>
          {content.sections.map((section) => <Box key={section.heading} sx={{ py: 2.5 }}>
            <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond", Georgia, serif', mb: 1 }}>{section.heading}</Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>{section.body}</Typography>
            <Divider sx={{ mt: 2.5, borderColor: 'rgba(184,151,88,.2)' }} />
          </Box>)}
        </> : <Typography variant="h4">Policy not found</Typography>}
        <Button component={Link} to="/" sx={{ mt: 2 }}>Return to store</Button>
      </Container>
    </Box>
  );
}
