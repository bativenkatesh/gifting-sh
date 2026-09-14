import React, { useEffect, useRef } from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STORY_TEXT =
  "WE BELIEVE IN CRAFTING WITH INTENTION, PROVENANCE, AND QUIET REVERENCE. SANNIDHI COLLECTIVE IS A LIVING SANCTUARY OF ARTISANAL HEIRLOOMS, RARE BOTANICALS, AND BESPOKE SENTIMENTS CRAFTED TO TRANSCEND GENERATIONS.";

export const ScrollStoryHero: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  const words = STORY_TEXT.split(' ');

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Smoothly fade out the hero crest emblem as the user begins scrolling
      if (logoRef.current && sectionRef.current) {
        gsap.to(logoRef.current, {
          opacity: 0,
          y: -24,
          scale: 0.9,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '220px top',
            scrub: true,
          },
        });
      }

      // 2. Scroll-scrubbed paragraph reveal: light stone gray -> solid obsidian black word by word
      if (textRef.current) {
        const wordSpans = textRef.current.querySelectorAll('.story-word');
        gsap.fromTo(
          wordSpans,
          { color: 'rgba(28, 25, 23, 0.16)' },
          {
            color: '#1C1917',
            stagger: 0.1,
            ease: 'none',
            scrollTrigger: {
              trigger: textRef.current,
              start: 'top 75%',
              end: 'bottom 42%',
              scrub: 1,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleScrollToPhilosophy = () => {
    const el = document.getElementById('philosophy');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box
      ref={sectionRef}
      sx={{
        backgroundColor: '#FAF8F5',
        position: 'relative',
        pt: { xs: 6, md: 9 },
        pb: { xs: 9, md: 14 },
        borderBottom: '1px solid rgba(184, 151, 88, 0.2)',
        overflow: 'hidden',
      }}
    >
      {/* Ambient Watermark Background Glow */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: { xs: 340, md: 680 },
          height: { xs: 340, md: 680 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(184, 151, 88, 0.08) 0%, rgba(201, 138, 144, 0.03) 50%, transparent 75%)',
          pointerEvents: 'none',
          filter: 'blur(50px)',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Top Floating Logo & Brand Moniker (Fades out completely on scroll) */}
        <Box
          ref={logoRef}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            mb: { xs: 5, md: 7 },
            willChange: 'opacity, transform',
          }}
        >
          <Box
            component="img"
            src="/logo.png"
            alt="Sannidhi Collective Crest"
            sx={{
              width: { xs: 78, md: 102 },
              height: 'auto',
              filter: 'drop-shadow(0 8px 24px rgba(184, 151, 88, 0.32))',
              mb: 1.5,
              animation: 'floatSlow 4s ease-in-out infinite alternate',
              '@keyframes floatSlow': {
                '0%': { transform: 'translateY(0px)' },
                '100%': { transform: 'translateY(-5px)' },
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontFamily: '"Cinzel", serif',
              letterSpacing: '0.42em',
              fontSize: { xs: '0.72rem', md: '0.78rem' },
              color: '#B89758',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            Sannidhi Collective
          </Typography>
        </Box>

        {/* "Our Story" Label with Accent Dot & Metadata */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: { xs: 3.5, md: 4.5 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.3 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#B89758',
                boxShadow: '0 0 10px rgba(184, 151, 88, 0.8)',
              }}
            />
            <Typography
              variant="subtitle2"
              sx={{
                fontFamily: '"Plus Jakarta Sans", "Cinzel", sans-serif',
                letterSpacing: '0.22em',
                fontSize: { xs: '0.76rem', md: '0.84rem' },
                color: '#1C1917',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Our Story
            </Typography>
          </Box>

          <Typography
            variant="caption"
            sx={{
              fontFamily: '"Plus Jakarta Sans", monospace, sans-serif',
              letterSpacing: '0.18em',
              fontSize: { xs: '0.68rem', md: '0.74rem' },
              color: '#8C6D34',
              fontWeight: 600,
              textTransform: 'uppercase',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            Sanctuary of Refined Sentiments • Vol. I
          </Typography>
        </Box>

        {/* The Scroll-Scrubbed Text Reveal Paragraph */}
        <Typography
          ref={textRef}
          component="p"
          sx={{
            fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: { xs: '1.95rem', sm: '2.9rem', md: '3.9rem', lg: '4.5rem' },
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.025em',
            textTransform: 'uppercase',
            maxWidth: 1100,
            mb: { xs: 6, md: 8 },
            userSelect: 'none',
          }}
        >
          {words.map((word, index) => (
            <span
              key={index}
              className="story-word"
              style={{
                color: 'rgba(28, 25, 23, 0.16)',
                display: 'inline-block',
                marginRight: '0.25em',
                transition: 'color 0.08s ease',
              }}
            >
              {word}
            </span>
          ))}
        </Typography>

        {/* Footer Line Under Paragraph: Founding Detail & Read Full Story Link */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            pt: 3.5,
            borderTop: '1px solid rgba(184, 151, 88, 0.28)',
            gap: 2,
          }}
        >
          {/* Founding detail with square block indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Box
              sx={{
                width: 7,
                height: 7,
                backgroundColor: '#1C1917',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"Plus Jakarta Sans", monospace, sans-serif',
                letterSpacing: '0.14em',
                fontSize: { xs: '0.72rem', md: '0.78rem' },
                color: '#57534E',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              [FOUNDED IN 2024 • ROOTED IN HERITAGE, BASED IN BANGALORE, INDIA]
            </Typography>
          </Box>

          {/* Read the full story link */}
          <Button
            onClick={handleScrollToPhilosophy}
            endIcon={<ArrowForward sx={{ fontSize: '0.95rem' }} />}
            sx={{
              color: '#B89758',
              fontFamily: '"Cinzel", serif',
              fontSize: '0.8rem',
              letterSpacing: '0.14em',
              fontWeight: 600,
              p: 0,
              minWidth: 'auto',
              borderBottom: '1px solid #B89758',
              borderRadius: 0,
              '&:hover': {
                backgroundColor: 'transparent',
                color: '#8C6D34',
                borderColor: '#8C6D34',
              },
            }}
          >
            Read the full story
          </Button>
        </Box>
      </Container>
    </Box>
  );
};
