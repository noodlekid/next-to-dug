"use client"
import React, { useEffect, useRef } from 'react';
import { Joystick } from '@/components/joystick/joystick';

const JoystickCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const joysticksRef = useRef<Joystick[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return console.log("joystick canvas error");
    const context = canvas.getContext('2d');
    if (!context) return console.error("joystick context error");

    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const joystick = new Joystick(window.innerWidth/2, window.innerHeight / 2, window.innerWidth / 8, window.innerWidth / 12);
    joysticksRef.current.push(joystick);

    joystick.listener();

    const fps = 120;
    const interval = setInterval(() => {
      context.clearRect(0, 0, width, height);
      joystick.update(context);
      joystick.draw(context);
    }, 1000 / fps);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return <canvas ref={canvasRef} />;
};

export default JoystickCanvas;