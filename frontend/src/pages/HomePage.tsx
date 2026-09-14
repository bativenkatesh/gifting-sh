import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Divider,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  Radio,
  Checkbox,
  TextField,
} from '@mui/material';
import {
  ArrowForward,
  SpaOutlined,
  LocalShippingOutlined,
  VerifiedUserOutlined,
} from '@mui/icons-material';
import { products, boxOptions, builderAddons, ribbonOptions, waxSealOptions } from '../data/products';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';
import { ScrollStoryHero } from '../components/home/ScrollStoryHero';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart, updateGiftOptions } = useCart();

  // Signature boxes from products
  const signatureBoxes = products.filter((p) => p.category === 'Heirloom Boxes');

  // Custom Gift Box Builder State
  const [activeStep, setActiveStep] = useState(0);
  const [selectedBoxId, setSelectedBoxId] = useState(boxOptions[0].id);
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['b-1', 'b-3']);
  const [selectedRibbon, setSelectedRibbon] = useState(ribbonOptions[0].id);
  const [selectedSeal, setSelectedSeal] = useState(waxSealOptions[0].id);
  const [customNote, setCustomNote] = useState('With my highest esteem and warmest affection on this auspicious day.');
  const [sender, setSender] = useState('Arthur Pendelton');
  const [recipient, setRecipient] = useState('Eleanor Vance');

  const currentBox = boxOptions.find((b) => b.id === selectedBoxId) || boxOptions[0];
  const currentAddonObjects = builderAddons.filter((a) => selectedAddons.includes(a.id));
  const addonsTotal = currentAddonObjects.reduce((sum, item) => sum + item.price, 0);
  const customBoxTotal = currentBox.price + addonsTotal;

  const handleToggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddCustomBoxToCart = () => {
    const customProduct: Product = {
      id: `custom-box-${Date.now()}`,
      name: `Bespoke ${currentBox.name}`,
      tagline: `${currentAddonObjects.length} Artisanal Items • Hand-Tied Ribbon • Wax Seal`,
      price: customBoxTotal,
      category: 'Heirloom Boxes',
      occasion: 'Milestone Celebrations',
      image: currentBox.image,
      badge: 'Bespoke Atelier',
      description: `Bespoke parcel crafted in ${currentBox.material}. Includes hand-calligraphed note with ${waxSealOptions.find(w => w.id === selectedSeal)?.name}.`,
      provenance: 'Hand-assembled in London Atelier',
      contents: currentAddonObjects.map((a) => a.name),
      isCustomBox: true,
    };

    addToCart(customProduct, 1, {
      boxStyle: currentBox.name,
      ribbonColor: ribbonOptions.find((r) => r.id === selectedRibbon)?.name,
      waxSeal: waxSealOptions.find((w) => w.id === selectedSeal)?.name,
      calligraphyNote: customNote,
      senderName: sender,
      recipientName: recipient,
      itemsIncluded: currentAddonObjects.map((a) => a.name),
    });

    updateGiftOptions({
      calligraphyNote: customNote,
      senderName: sender,
      recipientName: recipient,
      ribbonColor: selectedRibbon,
      waxSeal: selectedSeal,
    });
  };

  return (
    <Box sx={{ backgroundColor: '#FAF8F5' }}>
      {/* 1. SCROLL-SCRUBBED STORY HERO */}
      <ScrollStoryHero />

      {/* 2. VALUE ACCENTS BAR */}
      <Box
        sx={{
          backgroundColor: '#FAF8F5',
          borderBottom: '1px solid rgba(184, 151, 88, 0.2)',
          py: 3.5,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3} sx={{ justifyContent: 'center', alignItems: 'center' }}>
            {[
              {
                icon: <SpaOutlined sx={{ color: '#B89758', fontSize: '1.4rem' }} />,
                title: 'Single-Estate Ingredients',
                desc: 'Organically cultivated in Provence, Florence & the Himalayas',
              },
              {
                icon: <LocalShippingOutlined sx={{ color: '#B89758', fontSize: '1.4rem' }} />,
                title: 'White-Glove Courier',
                desc: 'Temperature-controlled insured delivery to your recipient',
              },
              {
                icon: <VerifiedUserOutlined sx={{ color: '#B89758', fontSize: '1.4rem' }} />,
                title: 'Heirloom Provenance',
                desc: 'Hand-signed certificate of authenticity in every parcel',
              },
            ].map((feature, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: { md: 2 } }}>
                  {feature.icon}
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontFamily: '"Cinzel", serif', fontSize: '0.78rem', color: '#1C1917', letterSpacing: '0.1em' }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#78716C', fontSize: '0.76rem', display: 'block' }}>
                      {feature.desc}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 3. SIGNATURE HEIRLOOM CURATIONS */}
      <Container maxWidth="xl" sx={{ py: { xs: 9, md: 14 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 9 } }}>
          <Typography
            variant="caption"
            sx={{
              fontFamily: '"Cinzel", serif',
              letterSpacing: '0.3em',
              color: '#B89758',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              display: 'block',
              mb: 1.5,
            }}
          >
            The Permanent Collection
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: { xs: '2.2rem', md: '3.4rem' },
              color: '#1C1917',
              maxWidth: 700,
              mx: 'auto',
            }}
          >
            Signature Gift Boxes
          </Typography>
          <Typography variant="body1" sx={{ color: '#78716C', mt: 1.5, maxWidth: 520, mx: 'auto' }}>
            Each ensemble is arranged inside our hand-pressed linen keepsake boxes with hand-tied Italian ribbons.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {signatureBoxes.map((box) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={box.id}>
              <Card
                className="gold-glow-hover"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(184, 151, 88, 0.22)',
                  position: 'relative',
                }}
              >
                {/* Image */}
                <Box sx={{ position: 'relative', pt: '100%', overflow: 'hidden', backgroundColor: '#F5F2EC' }}>
                  <CardMedia
                    component="img"
                    image={box.image}
                    alt={box.name}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.6s ease',
                      '&:hover': { transform: 'scale(1.05)' },
                    }}
                  />
                  {box.badge && (
                    <Chip
                      label={box.badge}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 14,
                        left: 14,
                        backgroundColor: 'rgba(28, 25, 23, 0.9)',
                        color: '#FAF8F5',
                        fontFamily: '"Cinzel", serif',
                        fontSize: '0.62rem',
                        letterSpacing: '0.12em',
                        borderRadius: 0,
                      }}
                    />
                  )}
                </Box>

                <CardContent sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: '"Cinzel", serif',
                      letterSpacing: '0.15em',
                      color: '#B89758',
                      fontSize: '0.68rem',
                      display: 'block',
                      mb: 0.8,
                    }}
                  >
                    {box.occasion}
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: '"Cormorant Garamond", serif',
                      fontSize: '1.4rem',
                      lineHeight: 1.25,
                      color: '#1C1917',
                      mb: 1,
                    }}
                  >
                    {box.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: '#78716C',
                      fontSize: '0.82rem',
                      lineHeight: 1.6,
                      mb: 2,
                      flex: 1,
                    }}
                  >
                    {box.tagline}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '1px solid rgba(184, 151, 88, 0.15)' }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                        fontWeight: 600,
                        color: '#1C1917',
                        fontSize: '1.15rem',
                      }}
                    >
                      ${box.price.toFixed(2)}
                    </Typography>

                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => addToCart(box, 1)}
                      sx={{
                        fontFamily: '"Cinzel", serif',
                        fontSize: '0.7rem',
                        letterSpacing: '0.1em',
                        borderColor: '#B89758',
                        color: '#1C1917',
                        py: 0.8,
                        px: 1.8,
                        '&:hover': {
                          backgroundColor: '#B89758',
                          color: '#FFFFFF',
                        },
                      }}
                    >
                      Add to Parcel
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 7 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/catalog')}
            endIcon={<ArrowForward />}
            sx={{ px: 4.5, py: 1.6 }}
          >
            View Full Product Catalog
          </Button>
        </Box>
      </Container>

      {/* 4. INTERACTIVE BESPOKE GIFT BOX BUILDER */}
      <Box
        id="builder"
        sx={{
          backgroundColor: '#F5F2EC',
          borderTop: '1px solid rgba(184, 151, 88, 0.25)',
          borderBottom: '1px solid rgba(184, 151, 88, 0.25)',
          py: { xs: 9, md: 13 },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"Cinzel", serif',
                letterSpacing: '0.3em',
                color: '#B89758',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                display: 'block',
                mb: 1.5,
              }}
            >
              The Atelier Studio
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontSize: { xs: '2.2rem', md: '3.4rem' },
                color: '#1C1917',
              }}
            >
              Craft a Bespoke Gift Box
            </Typography>
            <Typography variant="body1" sx={{ color: '#78716C', mt: 1, maxWidth: 600, mx: 'auto' }}>
              Select your presentation vessel, select hand-crafted additions, and dictate a personalized calligraphy card.
            </Typography>
          </Box>

          {/* Stepper Navigation */}
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              maxWidth: 600,
              mx: 'auto',
              mb: 6,
              '& .MuiStepLabel-label': {
                fontFamily: '"Cinzel", serif',
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#78716C',
                '&.Mui-active': { color: '#B89758', fontWeight: 600 },
                '&.Mui-completed': { color: '#1C1917' },
              },
              '& .MuiStepIcon-root': {
                color: '#E5DFD5',
                '&.Mui-active': { color: '#B89758' },
                '&.Mui-completed': { color: '#1C1917' },
              },
            }}
          >
            {['Vessel Selection', 'Artisan Provisions', 'Calligraphy & Seal'].map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Grid container spacing={5} sx={{ alignItems: 'flex-start' }}>
            {/* Left: Step Configurator */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Box sx={{ backgroundColor: '#FFFFFF', p: { xs: 3, md: 4.5 }, border: '1px solid rgba(184, 151, 88, 0.25)' }}>
                {/* STEP 1: BOX SELECTION */}
                {activeStep === 0 && (
                  <Box>
                    <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.6rem', mb: 2 }}>
                      1. Select Your Presentation Vessel
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#78716C', mb: 3 }}>
                      All vessels are lined with custom tissue and embossed with the Sannidhi Collective crest.
                    </Typography>

                    <RadioGroup
                      value={selectedBoxId}
                      onChange={(e) => setSelectedBoxId(e.target.value)}
                    >
                      {boxOptions.map((box) => (
                        <Box
                          key={box.id}
                          onClick={() => setSelectedBoxId(box.id)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            mb: 2,
                            border: selectedBoxId === box.id ? '2px solid #B89758' : '1px solid rgba(184, 151, 88, 0.2)',
                            backgroundColor: selectedBoxId === box.id ? 'rgba(184, 151, 88, 0.05)' : '#FFFFFF',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Radio value={box.id} sx={{ color: '#B89758', '&.Mui-checked': { color: '#B89758' } }} />
                            <Box
                              component="img"
                              src={box.image}
                              alt={box.name}
                              sx={{ width: 56, height: 56, objectFit: 'cover', border: '1px solid #E5DFD5' }}
                            />
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                                {box.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#78716C' }}>
                                {box.material}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 600, color: '#B89758' }}>
                            ${box.price.toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                    </RadioGroup>
                  </Box>
                )}

                {/* STEP 2: ARTISAN ADDONS */}
                {activeStep === 1 && (
                  <Box>
                    <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.6rem', mb: 1 }}>
                      2. Curate Your Artisanal Items
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#78716C', mb: 3 }}>
                      Select 2 to 5 bespoke provisions to complete your custom gift parcel.
                    </Typography>

                    <Grid container spacing={2}>
                      {builderAddons.map((addon) => {
                        const isSelected = selectedAddons.includes(addon.id);
                        return (
                          <Grid size={{ xs: 12, sm: 6 }} key={addon.id}>
                            <Box
                              onClick={() => handleToggleAddon(addon.id)}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                p: 1.5,
                                border: isSelected ? '2px solid #B89758' : '1px solid rgba(184, 151, 88, 0.2)',
                                backgroundColor: isSelected ? 'rgba(184, 151, 88, 0.06)' : '#FFFFFF',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                              }}
                            >
                              <Checkbox
                                checked={isSelected}
                                sx={{ color: '#B89758', '&.Mui-checked': { color: '#B89758' }, p: 0.8 }}
                              />
                              <Box
                                component="img"
                                src={addon.image}
                                alt={addon.name}
                                sx={{ width: 44, height: 44, objectFit: 'cover', mr: 1.5 }}
                              />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.3 }}>
                                  {addon.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#B89758', fontWeight: 600 }}>
                                  +${addon.price.toFixed(2)}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                )}

                {/* STEP 3: CALLIGRAPHY & SEALS */}
                {activeStep === 2 && (
                  <Box>
                    <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.6rem', mb: 1 }}>
                      3. Personalized Calligraphy & Wax Seal
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#78716C', mb: 3 }}>
                      Dictate the inscription for our in-house calligrapher on handmade deckle-edge cardstock.
                    </Typography>

                    <Grid container spacing={2.5} sx={{ mb: 3 }}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Recipient Title & Name"
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Sender Name"
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={sender}
                          onChange={(e) => setSender(e.target.value)}
                        />
                      </Grid>
                    </Grid>

                    <TextField
                      label="Hand-Calligraphed Note Inscription"
                      multiline
                      rows={3}
                      fullWidth
                      value={customNote}
                      onChange={(e) => setCustomNote(e.target.value)}
                      sx={{ mb: 3 }}
                    />

                    {/* Wax Seal Choice */}
                    <Typography variant="subtitle2" sx={{ fontFamily: '"Cinzel", serif', fontSize: '0.75rem', mb: 1.5 }}>
                      Select Signature Wax Seal
                    </Typography>
                    <Grid container spacing={1.5} sx={{ mb: 3 }}>
                      {waxSealOptions.map((seal) => (
                        <Grid size={4} key={seal.id}>
                          <Box
                            onClick={() => setSelectedSeal(seal.id)}
                            sx={{
                              p: 1.5,
                              textAlign: 'center',
                              cursor: 'pointer',
                              border: selectedSeal === seal.id ? '2px solid #B89758' : '1px solid rgba(184, 151, 88, 0.2)',
                              backgroundColor: selectedSeal === seal.id ? 'rgba(184, 151, 88, 0.08)' : '#FFFFFF',
                            }}
                          >
                            <Box
                              sx={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                backgroundColor: seal.color,
                                mx: 'auto',
                                mb: 0.8,
                                border: '1px solid rgba(0,0,0,0.1)',
                              }}
                            />
                            <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600, display: 'block' }}>
                              {seal.name}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>

                    {/* Ribbon Choice */}
                    <Typography variant="subtitle2" sx={{ fontFamily: '"Cinzel", serif', fontSize: '0.75rem', mb: 1.5 }}>
                      Hand-Tied Silk Ribbon
                    </Typography>
                    <Grid container spacing={1.5}>
                      {ribbonOptions.map((ribbon) => (
                        <Grid size={{ xs: 6, sm: 3 }} key={ribbon.id}>
                          <Box
                            onClick={() => setSelectedRibbon(ribbon.id)}
                            sx={{
                              p: 1,
                              textAlign: 'center',
                              cursor: 'pointer',
                              border: selectedRibbon === ribbon.id ? '2px solid #B89758' : '1px solid rgba(184, 151, 88, 0.2)',
                              backgroundColor: selectedRibbon === ribbon.id ? 'rgba(184, 151, 88, 0.08)' : '#FFFFFF',
                            }}
                          >
                            <Box
                              sx={{
                                width: '100%',
                                height: 8,
                                backgroundColor: ribbon.color,
                                mb: 0.5,
                                border: '1px solid rgba(0,0,0,0.1)',
                              }}
                            />
                            <Typography variant="caption" sx={{ fontSize: '0.68rem' }}>
                              {ribbon.name}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* Step Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '1px solid rgba(184, 151, 88, 0.2)' }}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={() => setActiveStep((prev) => prev - 1)}
                    variant="outlined"
                  >
                    Previous
                  </Button>

                  {activeStep < 2 ? (
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep((prev) => prev + 1)}
                    >
                      Next Step
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleAddCustomBoxToCart}
                      sx={{ backgroundColor: '#B89758', '&:hover': { backgroundColor: '#8C6D34' } }}
                    >
                      Add Bespoke Box to Parcel (${customBoxTotal.toFixed(2)})
                    </Button>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* Right: Live Builder Summary Card */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  backgroundColor: '#FFFFFF',
                  p: { xs: 3, md: 4 },
                  border: '1px solid rgba(184, 151, 88, 0.3)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Cinzel", serif',
                    letterSpacing: '0.2em',
                    color: '#B89758',
                    textTransform: 'uppercase',
                    fontSize: '0.72rem',
                    display: 'block',
                    mb: 1,
                  }}
                >
                  Live Curation Review
                </Typography>

                <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.5rem', mb: 2 }}>
                  Bespoke Gift Ensemble
                </Typography>

                {/* Box Image Preview */}
                <Box
                  component="img"
                  src={currentBox.image}
                  alt={currentBox.name}
                  sx={{
                    width: '100%',
                    height: 180,
                    objectFit: 'cover',
                    border: '1px solid rgba(184, 151, 88, 0.2)',
                    mb: 2.5,
                  }}
                />

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{currentBox.name}</Typography>
                    <Typography variant="body2" sx={{ color: '#B89758', fontWeight: 600 }}>${currentBox.price.toFixed(2)}</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#78716C', display: 'block' }}>{currentBox.material}</Typography>
                </Box>

                <Divider sx={{ my: 1.5, borderColor: 'rgba(184, 151, 88, 0.15)' }} />

                {/* Selected Addons */}
                <Typography variant="caption" sx={{ fontFamily: '"Cinzel", serif', color: '#78716C', letterSpacing: '0.1em', display: 'block', mb: 1 }}>
                  Artisanal Provisions ({currentAddonObjects.length})
                </Typography>
                {currentAddonObjects.length === 0 ? (
                  <Typography variant="caption" sx={{ color: '#A8A29E', fontStyle: 'italic' }}>
                    No additions selected yet.
                  </Typography>
                ) : (
                  currentAddonObjects.map((addon) => (
                    <Box key={addon.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#44403C' }}>• {addon.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#78716C' }}>${addon.price.toFixed(2)}</Typography>
                    </Box>
                  ))
                )}

                <Divider sx={{ my: 1.5, borderColor: 'rgba(184, 151, 88, 0.15)' }} />

                {/* Seal & Ribbon Preview */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#78716C' }}>Wax Seal:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {waxSealOptions.find((w) => w.id === selectedSeal)?.name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#78716C' }}>Silk Ribbon:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {ribbonOptions.find((r) => r.id === selectedRibbon)?.name}
                  </Typography>
                </Box>

                <Box sx={{ p: 2, backgroundColor: 'rgba(184, 151, 88, 0.08)', border: '1px solid rgba(184, 151, 88, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Typography variant="subtitle2" sx={{ fontFamily: '"Cinzel", serif', letterSpacing: '0.12em' }}>
                    Curation Total:
                  </Typography>
                  <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, color: '#B89758' }}>
                    ${customBoxTotal.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 5. ATELIER PHILOSOPHY & OLD MONEY STORY */}
      <Container id="philosophy" maxWidth="lg" sx={{ py: { xs: 9, md: 14 } }}>
        <Grid container spacing={8} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ position: 'relative' }}>
              <Box
                component="img"
                src="/botanical_box.jpg"
                alt="The Atelier Craft"
                sx={{
                  width: '100%',
                  height: { xs: 360, md: 480 },
                  objectFit: 'cover',
                  border: '1px solid rgba(184, 151, 88, 0.3)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -24,
                  right: { xs: 12, md: -24 },
                  backgroundColor: '#1C1917',
                  color: '#FAF8F5',
                  p: 3,
                  maxWidth: 260,
                  border: '1px solid #B89758',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                <Typography variant="caption" sx={{ fontFamily: '"Cinzel", serif', color: '#B89758', letterSpacing: '0.15em', display: 'block', mb: 0.5 }}>
                  Quiet Luxury
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1rem', lineHeight: 1.4 }}>
                  "Gifts are not merely objects; they are lasting emblems of unspoken devotion."
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"Cinzel", serif',
                letterSpacing: '0.3em',
                color: '#B89758',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                display: 'block',
                mb: 1.5,
              }}
            >
              The Atelier Philosophy
            </Typography>

            <Typography
              variant="h2"
              sx={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontSize: { xs: '2.2rem', md: '3.2rem' },
                color: '#1C1917',
                lineHeight: 1.15,
                mb: 3,
              }}
            >
              The Art of the Thoughtful Gesture
            </Typography>

            <Typography variant="body1" sx={{ color: '#57534E', lineHeight: 1.8, mb: 2.5 }}>
              Founded on the belief that meaningful connections transcend ephemeral trends, Sannidhi Collective partners exclusively with century-old family mills, monastic perfumeries, and master potters across Europe and India.
            </Typography>

            <Typography variant="body1" sx={{ color: '#57534E', lineHeight: 1.8, mb: 4 }}>
              Every package is blessed with our signature lotus wax seal — each seal hand-stamped in melted beeswax, ensuring that the act of unboxing is as memorable as the treasure within.
            </Typography>

            <Button
              variant="outlined"
              onClick={() => navigate('/catalog')}
              endIcon={<ArrowForward />}
            >
              Explore Our Catalog
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
