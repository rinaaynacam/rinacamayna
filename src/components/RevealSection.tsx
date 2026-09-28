'use client';

import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react';

export function RevealSection({ children, ...props }: HTMLMotionProps<'section'>) {
  const reduceMotion = useReducedMotion();

  return <motion.section
    {...props}
    data-motion-reveal="true"
    initial={reduceMotion ? false : { y: 28 }}
    whileInView={{ y: 0 }}
    viewport={{ once: true, amount: 0.08, margin: '0px 0px -8% 0px' }}
    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
  >{children}</motion.section>;
}
