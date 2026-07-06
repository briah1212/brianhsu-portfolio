"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

type Operator = "+" | "-" | "*" | "/" | null;

export function CalculatorApp() {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const handleNumber = useCallback(
    (num: string) => {
      if (waitingForOperand) {
        setDisplay(num);
        setWaitingForOperand(false);
      } else {
        setDisplay(display === "0" ? num : display + num);
      }
    },
    [display, waitingForOperand]
  );

  const handleOperator = useCallback(
    (nextOperator: Operator) => {
      const inputValue = parseFloat(display);

      if (previousValue === null) {
        setPreviousValue(inputValue);
      } else if (operator) {
        const currentValue = previousValue || 0;
        let newValue = currentValue;

        switch (operator) {
          case "+":
            newValue = currentValue + inputValue;
            break;
          case "-":
            newValue = currentValue - inputValue;
            break;
          case "*":
            newValue = currentValue * inputValue;
            break;
          case "/":
            newValue = currentValue / inputValue;
            break;
        }

        setDisplay(String(newValue));
        setPreviousValue(newValue);
      }

      setWaitingForOperand(true);
      setOperator(nextOperator);
    },
    [display, operator, previousValue]
  );

  const handleEquals = useCallback(() => {
    const inputValue = parseFloat(display);

    if (operator && previousValue !== null) {
      let newValue = previousValue;

      switch (operator) {
        case "+":
          newValue = previousValue + inputValue;
          break;
        case "-":
          newValue = previousValue - inputValue;
          break;
        case "*":
          newValue = previousValue * inputValue;
          break;
        case "/":
          newValue = previousValue / inputValue;
          break;
      }

      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  }, [display, operator, previousValue]);

  const handleClear = useCallback(() => {
    setDisplay("0");
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  }, []);

  const handleDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  }, [display, waitingForOperand]);

  const handleBackspace = useCallback(() => {
    if (!waitingForOperand) {
      const newDisplay = display.slice(0, -1);
      setDisplay(newDisplay === "" ? "0" : newDisplay);
    }
  }, [display, waitingForOperand]);

  const handlePercentage = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  }, [display]);

  const handleNegate = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(value * -1));
  }, [display]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleNumber(e.key);
      } else if (e.key === ".") {
        handleDecimal();
      } else if (e.key === "+" || e.key === "-" || e.key === "*" || e.key === "/") {
        handleOperator(e.key);
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        handleEquals();
      } else if (e.key === "Escape" || e.key === "c" || e.key === "C") {
        handleClear();
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === "%") {
        handlePercentage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleNumber,
    handleOperator,
    handleEquals,
    handleClear,
    handleDecimal,
    handleBackspace,
    handlePercentage,
  ]);

  return (
    <div className="app-content flex h-full w-full flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[280px]"
      >
        {/* Display */}
        <div className="mb-4 rounded-lg border border-foreground/10 bg-foreground/5 px-5 py-6 backdrop-blur-sm">
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-right text-4xl font-light tracking-tight text-foreground">
            {display}
          </div>
        </div>

        {/* Button Grid */}
        <div className="grid grid-cols-4 gap-2">
          {/* Row 1 */}
          <CalcButton onClick={handleClear} variant="function">
            C
          </CalcButton>
          <CalcButton onClick={handleNegate} variant="function">
            +/−
          </CalcButton>
          <CalcButton onClick={handlePercentage} variant="function">
            %
          </CalcButton>
          <CalcButton onClick={() => handleOperator("/")} variant="operator">
            ÷
          </CalcButton>

          {/* Row 2 */}
          <CalcButton onClick={() => handleNumber("7")}>7</CalcButton>
          <CalcButton onClick={() => handleNumber("8")}>8</CalcButton>
          <CalcButton onClick={() => handleNumber("9")}>9</CalcButton>
          <CalcButton onClick={() => handleOperator("*")} variant="operator">
            ×
          </CalcButton>

          {/* Row 3 */}
          <CalcButton onClick={() => handleNumber("4")}>4</CalcButton>
          <CalcButton onClick={() => handleNumber("5")}>5</CalcButton>
          <CalcButton onClick={() => handleNumber("6")}>6</CalcButton>
          <CalcButton onClick={() => handleOperator("-")} variant="operator">
            −
          </CalcButton>

          {/* Row 4 */}
          <CalcButton onClick={() => handleNumber("1")}>1</CalcButton>
          <CalcButton onClick={() => handleNumber("2")}>2</CalcButton>
          <CalcButton onClick={() => handleNumber("3")}>3</CalcButton>
          <CalcButton onClick={() => handleOperator("+")} variant="operator">
            +
          </CalcButton>

          {/* Row 5 */}
          <CalcButton onClick={() => handleNumber("0")} className="col-span-2">
            0
          </CalcButton>
          <CalcButton onClick={handleDecimal}>.</CalcButton>
          <CalcButton onClick={handleEquals} variant="operator">
            =
          </CalcButton>
        </div>
      </motion.div>
    </div>
  );
}

interface CalcButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "number" | "operator" | "function";
  className?: string;
}

function CalcButton({
  onClick,
  children,
  variant = "number",
  className = "",
}: CalcButtonProps) {
  const baseStyles = "rounded-lg text-base font-medium transition-all border";
  const variantStyles = {
    number: 
      "bg-foreground/5 border-foreground/10 text-foreground hover:bg-foreground/10 hover:border-foreground/15 active:bg-foreground/15",
    operator: 
      "bg-sky-400/10 border-sky-400/30 text-sky-400 hover:bg-sky-400/20 hover:border-sky-400/40 active:bg-sky-400/30",
    function: 
      "bg-foreground/8 border-foreground/15 text-foreground/70 hover:bg-foreground/12 hover:text-foreground active:bg-foreground/15",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className} h-14 ${
        className.includes("col-span-2") ? "" : "w-14"
      }`}
    >
      {children}
    </motion.button>
  );
}
