import { useState, useEffect } from 'react';

interface DonaTitleProps {
  isPaused?: boolean;
}

const TITLE = 'Dona';
const TYPE_SPEED = 150;
const DELETE_SPEED = 100;
const PAUSE_AFTER_TYPE = 3000;
const PAUSE_AFTER_DELETE = 500;

const fonts = [
  '"Poppins", sans-serif',
  '"Inter", sans-serif',
  '"Montserrat", sans-serif',
  '"Nunito Sans", sans-serif',
  '"Playfair Display", Georgia, serif',
  '"Rubik", sans-serif',
];

export function DonaTitle({ isPaused = false }: DonaTitleProps) {
  const [text, setText] = useState(TITLE);
  const [fontIndex, setFontIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    if (isWaiting) {
      const timer = setTimeout(() => {
        setIsWaiting(false);
        setIsDeleting(true);
        setIsTyping(true);
      }, PAUSE_AFTER_TYPE);
      return () => clearTimeout(timer);
    }

    if (isDeleting) {
      if (text.length > 0) {
        setIsTyping(true);
        const timer = setTimeout(() => {
          setText(text.slice(0, -1));
        }, DELETE_SPEED);
        return () => clearTimeout(timer);
      } else {
        setIsTyping(false);
        const timer = setTimeout(() => {
          setFontIndex((i) => (i + 1) % fonts.length);
          setIsDeleting(false);
        }, PAUSE_AFTER_DELETE);
        return () => clearTimeout(timer);
      }
    }

    if (!isDeleting && text.length < TITLE.length) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setText(TITLE.slice(0, text.length + 1));
      }, TYPE_SPEED);
      return () => clearTimeout(timer);
    }

    if (!isDeleting && text.length === TITLE.length) {
      setIsTyping(false);
      const timer = setTimeout(() => {
        setIsDeleting(true);
        setIsTyping(true);
      }, PAUSE_AFTER_TYPE);
      return () => clearTimeout(timer);
    }
  }, [text, isDeleting, isWaiting, isPaused]);

  const shouldBlink = !isTyping;

  return (
    <h1 className="dona-title" aria-label={TITLE}>
      <span style={{ fontFamily: fonts[fontIndex] }} aria-hidden="true">
        {text}
      </span>
      <span className={`dona-cursor ${shouldBlink ? 'blinking' : ''}`} aria-hidden="true">
        |
      </span>
    </h1>
  );
}
