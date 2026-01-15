import React, { useEffect, useRef } from 'react';

const Bganimation = () => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: null, y: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.size = Math.random() * 1.5 + 1;
        this.speedX = (Math.random() - 0.5) * 0.4; // Slightly slower for tech feel
        this.speedY = (Math.random() - 0.5) * 0.4;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around screen
        if (this.x > canvas.width) this.x = 0;
        else if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        else if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      // Increased particles for more connection opportunities
      const numberOfParticles = (canvas.width * canvas.height) / 9000;
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    };

const handleLines = () => {
  for (let a = 0; a < particles.length; a++) {
    for (let b = a + 1; b < particles.length; b++) {
      let dx = particles[a].x - particles[b].x;
      let dy = particles[a].y - particles[b].y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      // Only draw lines if dots are close to each other
      if (distance < 120) {
        let opacity = 1 - distance / 120;
        let isNearMouse = false;

        // CHECK IF MOUSE IS NEAR EITHER PARTICLE
        if (mouse.current.x != null) {
          let mdx = particles[a].x - mouse.current.x;
          let mdy = particles[a].y - mouse.current.y;
          let mDistance = Math.sqrt(mdx * mdx + mdy * mdy);

          // If the mouse is within 150px of the particle, trigger the shine
          if (mDistance < 150) {
            isNearMouse = true;
          }
        }

        // DRAWING LOGIC
        if (isNearMouse) {
          // 🌟 THE SHINE EFFECT (Triggered by Mouse)
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`; // White shine
          ctx.lineWidth = 1.2;
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#3b82f6';
        } else {
          // 🌑 NORMAL BACKGROUND STATE (Faint)
          ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.8})`; 
          ctx.lineWidth = 0.3;
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
        
        // Always reset shadow after drawing
        ctx.shadowBlur = 0;
      }
    }
  }
};

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      handleLines();
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      // Use clientX/Y for accurate viewport position
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    
    resize();
    init();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-[#020617] pointer-events-none">
      {/* 1. Static Grid Overlay (Matches Dashboard) */}
      <div 
        className="absolute inset-0 opacity-[0.05]" 
        style={{
          backgroundImage: `linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* 2. Interactive Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      {/* 3. Vignette mask to keep edges clean */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)]" />
    </div>
  );
};

export default Bganimation;
