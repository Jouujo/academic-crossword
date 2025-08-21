"use client";

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Poppins } from 'next/font/google'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins'
})

export default function Home() {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const words = [
    "Inspired by the New York Times'🧠 Daily Mini, you can create and play a crossword puzzle, but now with your own clues based on the subject you're learning! Explore the site and have fun!",
    "Build engaging educational puzzles that make learning interactive and fun for your students.",
    "Generate custom crosswords with smart grid placement and intuitive clue management.",
    "Have fun!"
  ];

  useEffect(() => {
    const currentWord = words[currentIndex];
    
    if (isDeleting) {
      // Deleting effect
      if (currentText.length > 0) {
        const timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, 90);
        return () => clearTimeout(timeout);
      } else {
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % words.length);
      }
    } else {
      // Typing effect
      if (currentText.length < currentWord.length) {
        const timeout = setTimeout(() => {
          setCurrentText(currentWord.slice(0, currentText.length + 1));
        }, 95);
        return () => clearTimeout(timeout);
      } else {
        // Wait before starting to delete
        const timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 3000);
        return () => clearTimeout(timeout);
      }
    }
  }, [currentText, currentIndex, isDeleting, words]);

  return (
    <div className={`text-center ${poppins.variable} font-poppins`}>
      {/* Hero section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Academic Mini-Crossword Generator
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto min-h-[3rem]">
          {currentText}
          <span className="animate-pulse">|</span>
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center">
        <Link 
          href="/tutor"
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
        >
          Create New Puzzle
        </Link>
      </div>

      {/* Feature highlights */}
      <div className="mt-16 grid md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✏️</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Easy Creation</h3>
          <p className="text-gray-600">It's easy to create! Just enter your clues in the form + see a preview of your puzzle!</p>

        </div>
        
        <div className="text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Smart Generation</h3>
          <p className="text-gray-600">Grid generation is done automatically, as easy as 1..2..3..</p>
        </div>
        
        <div className="text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎮</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Interactive Learning</h3>
          <p className="text-gray-600">Engaging puzzle-solving experience for students</p>
        </div>
      </div>
    </div>
  )
}