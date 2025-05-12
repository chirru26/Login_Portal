import { useEffect, useRef } from 'react';
import { useTheme } from "@/components/theme-provider";

// Define the star type outside the component
interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleDirection: boolean;
  color: string;
  angle: number;
  tail?: boolean;
  tailLength: number; // Make required to fix TypeScript errors
  initialDelay: number; // Make required to fix TypeScript errors
}

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas to full screen
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    // Create stars with more varied properties
    const stars: Star[] = [];
    
    const starCount = Math.floor((canvas.width * canvas.height) / 1500); // Higher density
    
    // Get colors based on theme
    const getStarColors = () => {
      if (theme === 'dark') {
        return [
          'rgba(255, 255, 255, 0.8)',
          'rgba(220, 220, 255, 0.7)',
          'rgba(230, 230, 255, 0.9)',
          'rgba(200, 200, 255, 0.6)',
          'rgba(255, 255, 220, 0.7)'
        ];
      } else {
        return [
          'rgba(0, 0, 50, 0.6)',
          'rgba(20, 20, 70, 0.5)',
          'rgba(30, 30, 80, 0.7)',
          'rgba(50, 50, 100, 0.5)',
          'rgba(40, 0, 80, 0.5)'
        ];
      }
    };
    
    const starColors = getStarColors();
    
    // Background stars (slower, smaller)
    for (let i = 0; i < starCount; i++) {
      // Distribute more stars at the top of the screen
      const yBias = Math.pow(Math.random(), 1.5); // Bias towards smaller values
      
      stars.push({
        x: Math.random() * canvas.width,
        y: yBias * canvas.height,
        size: Math.random() * 1.5 + 0.5, // Slightly smaller range
        speed: Math.random() * 0.15 + 0.05, // Slower
        opacity: Math.random() * 0.5 + 0.5, // Random starting opacity
        twinkleSpeed: Math.random() * 0.03 + 0.01, // Speed of twinkling effect
        twinkleDirection: Math.random() > 0.5, // Whether opacity is increasing or decreasing
        color: starColors[Math.floor(Math.random() * starColors.length)], // Random color
        angle: Math.PI / 2, // Straight down
        tailLength: 0, // No tail for background stars
        initialDelay: 0 // No delay for background stars
      });
    }
    
    // Add a few extra-large stars
    for (let i = 0; i < 5; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 2.5, // Larger stars
        speed: Math.random() * 0.08 + 0.02, // Slower movement
        opacity: Math.random() * 0.3 + 0.7, // Brighter
        twinkleSpeed: Math.random() * 0.05 + 0.02, // Faster twinkling
        twinkleDirection: Math.random() > 0.5,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        angle: Math.PI / 2,
        tailLength: 0, // No tail for these stars
        initialDelay: 0 // No delay
      });
    }
    
    // Add several highly visible shooting stars with dramatic effect
    // Much smaller count, but more dramatic and obvious
    const shootingStarsDramatic = 5;
    
    for (let i = 0; i < shootingStarsDramatic; i++) {
      // Start from random positions but ensure they're visible across the screen
      const x = Math.random() * canvas.width;
      const y = -50; // Start above viewport
      
      // Slightly narrower angle range for more predictable diagonal motion
      const angleVariation = (Math.random() * 30 - 15) * (Math.PI / 180);
      const angle = Math.PI / 2 + angleVariation;
      
      // Stagger their appearance
      const initialDelay = i * 40; // Sequential appearance
      
      stars.push({
        x,
        y,
        size: 4 + Math.random() * 3, // Much larger stars
        speed: 7 + Math.random() * 3, // Much faster
        opacity: 0, // Start invisible
        twinkleSpeed: 0, // No twinkling
        twinkleDirection: true,
        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(20, 20, 150, 0.95)',
        angle,
        tail: true,
        tailLength: 300 + Math.random() * 200, // Very long tails
        initialDelay
      });
    }
    
    // Create a periodic shooting star event system
    const createShootingStarBurst = () => {
      if (!canvasRef.current) return;
      
      // Create a burst of 5-8 stars at once
      const burstCount = Math.floor(Math.random() * 4) + 5;
      
      for (let i = 0; i < burstCount; i++) {
        // Pick a random edge of the screen to start from
        const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        let x: number = 0;
        let y: number = 0;
        let angle: number = 0;
        
        // Set position and angle based on the chosen edge
        switch (edge) {
          case 0: // top
            x = Math.random() * canvas.width;
            y = -50;
            angle = (Math.PI / 2) + ((Math.random() * 40 - 20) * (Math.PI / 180));
            break;
          case 1: // right
            x = canvas.width + 50;
            y = Math.random() * canvas.height * 0.7;
            angle = Math.PI + ((Math.random() * 40 - 20) * (Math.PI / 180));
            break;
          case 2: // bottom - less likely
            if (Math.random() > 0.3) { // 70% chance to reroll to top
              x = Math.random() * canvas.width;
              y = -50;
              angle = (Math.PI / 2) + ((Math.random() * 40 - 20) * (Math.PI / 180));
            } else {
              x = Math.random() * canvas.width;
              y = canvas.height + 50;
              angle = (Math.PI * 3 / 2) + ((Math.random() * 40 - 20) * (Math.PI / 180));
            }
            break;
          case 3: // left
            x = -50;
            y = Math.random() * canvas.height * 0.7;
            angle = 0 + ((Math.random() * 40 - 20) * (Math.PI / 180));
            break;
        }
        
        // Create the star with sequential timing
        stars.push({
          x,
          y,
          size: 3 + Math.random() * 3,
          speed: 7 + Math.random() * 4,
          opacity: 0,
          twinkleSpeed: 0,
          twinkleDirection: true,
          color: theme === 'dark' 
            ? `rgba(${220 + Math.random() * 35}, ${220 + Math.random() * 35}, ${255}, 0.95)` 
            : `rgba(${Math.random() * 30}, ${Math.random() * 30}, ${120 + Math.random() * 30}, 0.95)`,
          angle,
          tail: true,
          tailLength: 250 + Math.random() * 250,
          initialDelay: i * 25 // Stagger the stars slightly in the burst
        });
      }
      
      // Schedule the next burst at a much shorter interval for more continuous effects
      const nextBurstDelay = Math.random() * 1500 + 500; // Much shorter delay (0.5-2 seconds)
      setTimeout(createShootingStarBurst, nextBurstDelay);
    };
    
    // Start the first burst after a short delay
    setTimeout(createShootingStarBurst, 1500);
    
    // Create multiple initial star waves from different edges to ensure immediate visibility
    
    // First immediate wave from top
    setTimeout(() => {
      if (!canvasRef.current) return;
      
      for (let i = 0; i < 5; i++) {
        // Distribute across top edge
        const x = (canvas.width / 5) * i + (Math.random() * canvas.width / 5);
        const y = -50;
        
        // Various downward angles
        const angleVariation = (Math.random() * 40 - 20) * (Math.PI / 180);
        const angle = Math.PI / 2 + angleVariation;
        
        stars.push({
          x,
          y,
          size: 4 + Math.random() * 3,
          speed: 7 + Math.random() * 3,
          opacity: 0.9, // Start visible immediately
          twinkleSpeed: 0,
          twinkleDirection: true,
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 120, 0.95)',
          angle,
          tail: true,
          tailLength: 300 + Math.random() * 200,
          initialDelay: 0 // No delay, start immediately
        });
      }
    }, 200);
    
    // Second wave from right after slight delay
    setTimeout(() => {
      if (!canvasRef.current) return;
      
      for (let i = 0; i < 3; i++) {
        const x = canvas.width + 50;
        const y = canvas.height * (i / 3);
        
        // Leftward angles
        const angleVariation = (Math.random() * 20 - 10) * (Math.PI / 180);
        const angle = Math.PI + angleVariation;
        
        stars.push({
          x,
          y,
          size: 4 + Math.random() * 3,
          speed: 7 + Math.random() * 3,
          opacity: 0.9,
          twinkleSpeed: 0,
          twinkleDirection: true,
          color: theme === 'dark' ? 'rgba(220, 220, 255, 0.95)' : 'rgba(20, 20, 150, 0.95)',
          angle,
          tail: true,
          tailLength: 300 + Math.random() * 200,
          initialDelay: 0
        });
      }
    }, 600);
    
    // Third wave from left side
    setTimeout(() => {
      if (!canvasRef.current) return;
      
      for (let i = 0; i < 3; i++) {
        const x = -50;
        const y = canvas.height * (i / 3); 
        
        // Rightward angles
        const angleVariation = (Math.random() * 20 - 10) * (Math.PI / 180);
        const angle = 0 + angleVariation;
        
        stars.push({
          x,
          y,
          size: 4 + Math.random() * 3,
          speed: 7 + Math.random() * 3,
          opacity: 0.9,
          twinkleSpeed: 0,
          twinkleDirection: true,
          color: theme === 'dark' ? 'rgba(220, 230, 255, 0.95)' : 'rgba(0, 20, 120, 0.95)',
          angle,
          tail: true,
          tailLength: 300 + Math.random() * 200,
          initialDelay: 0
        });
      }
    }, 1000);
    
    // Animation loop
    let animationId: number;
    let time = 0;
    
    const animate = () => {
      time += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw and update stars
      stars.forEach(star => {
        // Handle twinkling
        if (star.twinkleDirection) {
          star.opacity += star.twinkleSpeed;
          if (star.opacity >= 1) {
            star.opacity = 1;
            star.twinkleDirection = false;
          }
        } else {
          star.opacity -= star.twinkleSpeed;
          if (star.opacity <= 0.2) {
            star.opacity = 0.2;
            star.twinkleDirection = true;
          }
        }
        
        // Set color with opacity
        const color = star.color.replace(/[\d.]+\)$/, `${star.opacity})`);
        
        // Draw tails for shooting stars
        if (star.tail && star.tailLength) {
          // Calculate the tail end position (opposite to the direction of travel)
          const tailEndX = star.x - Math.cos(star.angle) * star.tailLength;
          const tailEndY = star.y - Math.sin(star.angle) * star.tailLength;
          
          // Create gradient for tail
          const tailGradient = ctx.createLinearGradient(
            star.x, star.y,
            tailEndX, tailEndY
          );
          
          // Make the gradient more visible
          tailGradient.addColorStop(0, color.replace(/[\d.]+\)$/, '1)')); // Full opacity at head
          tailGradient.addColorStop(0.1, color); // Slight fade
          tailGradient.addColorStop(1, 'transparent');
          
          // Draw much thicker tail for dramatic effect
          ctx.beginPath();
          ctx.strokeStyle = tailGradient;
          ctx.lineWidth = star.size * 1.5; // Thicker line
          ctx.lineCap = 'round';
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(tailEndX, tailEndY);
          ctx.stroke();
          
          // Add a second tail for extra brightness in the center
          if (star.size > 3) {
            const innerTailGradient = ctx.createLinearGradient(
              star.x, star.y,
              tailEndX, tailEndY
            );
            
            innerTailGradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); // White core
            innerTailGradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.5)');
            innerTailGradient.addColorStop(1, 'transparent');
            
            ctx.beginPath();
            ctx.strokeStyle = innerTailGradient;
            ctx.lineWidth = star.size * 0.7; // Thinner inner tail
            ctx.lineCap = 'round';
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(tailEndX, tailEndY);
            ctx.stroke();
          }
        }
        
        // Draw star
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect for larger stars or shooting stars
        if (star.size > 1.5 || star.tail) {
          // Different glow handling for shooting stars vs regular stars
          if (star.tail) {
            // Two-layer glow for shooting stars - outer glow
            const outerGlowSize = star.size * 6;
            const outerGradient = ctx.createRadialGradient(
              star.x, star.y, 0,
              star.x, star.y, outerGlowSize
            );
            
            // Use the star's color but with lower opacity for outer glow
            outerGradient.addColorStop(0, color.replace(/[\d.]+\)$/, '0.7)'));
            outerGradient.addColorStop(0.5, color.replace(/[\d.]+\)$/, '0.3)'));
            outerGradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = outerGradient;
            ctx.beginPath();
            ctx.arc(star.x, star.y, outerGlowSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner bright core glow
            const innerGlowSize = star.size * 2;
            const innerGradient = ctx.createRadialGradient(
              star.x, star.y, 0,
              star.x, star.y, innerGlowSize
            );
            
            // Brighter white/blue center regardless of star color for dramatic effect
            const glowColor = theme === 'dark' 
              ? 'rgba(255, 255, 255, 0.95)' 
              : 'rgba(150, 170, 255, 0.9)';
              
            innerGradient.addColorStop(0, glowColor);
            innerGradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = innerGradient;
            ctx.beginPath();
            ctx.arc(star.x, star.y, innerGlowSize, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Standard glow for regular stars
            const glowSize = star.size * 4;
            const gradient = ctx.createRadialGradient(
              star.x, star.y, 0,
              star.x, star.y, glowSize
            );
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        
        // Move stars based on their angle and speed
        if (star.tail) {
          // Check if the star should still be delayed
          if (star.initialDelay && star.initialDelay > 0) {
            // Decrease the delay counter
            star.initialDelay--;
            
            // If delay just ended, make star visible
            if (star.initialDelay === 0) {
              star.opacity = 0.9;
            }
          } else {
            // Only move the star if it's not delayed
            star.x += Math.cos(star.angle) * star.speed;
            star.y += Math.sin(star.angle) * star.speed;
            
            // Reset shooting stars when they go off screen
            if (star.y > canvas.height || 
                star.y < -100 || 
                star.x > canvas.width + 100 || 
                star.x < -100) {
              // Reset to a new random position at the top
              star.x = Math.random() * canvas.width;
              star.y = -50 - Math.random() * 100; // Vary the starting height
              
              // New random angle
              const angleVariation = (Math.random() * 90 - 45) * (Math.PI / 180);
              star.angle = Math.PI / 2 + angleVariation;
              
              // New random tail length
              star.tailLength = Math.random() * 150 + 100;
              
              // Set new delay for continuous wave effect
              star.initialDelay = Math.floor(Math.random() * 150);
              star.opacity = 0; // Start invisible again
            }
          }
        } else {
          // Regular stars have gentle sway and mostly fall down
          star.y += star.speed;
          star.x += Math.sin(time + star.y * 0.05) * 0.2;
          
          // Reset regular stars
          if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
          }
        }
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationId);
    };
  }, [theme]); // Re-run when theme changes
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
    />
  );
}