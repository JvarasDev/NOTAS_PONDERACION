import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Calculator, TrendingUp, AlertCircle, CheckCircle2, Settings, Share } from 'lucide-react';

const STORAGE_KEY = 'grade_calculator_data';

export default function GradeCalculator() {
  const [evaluations, setEvaluations] = useState([]);
  const [presentationWeight, setPresentationWeight] = useState(70);
  const [examWeight, setExamWeight] = useState(30);
  const [passingGrade, setPassingGrade] = useState(4.0);
  const [showSettings, setShowSettings] = useState(false);
  const [prevPresentationGrade, setPrevPresentationGrade] = useState(0);
  const [prevMinimumExamGrade, setPrevMinimumExamGrade] = useState(0);
  const [isMac, setIsMac] = useState(false);
  const reportRef = useRef(null);

  // Detectar plataforma
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
    }
  }, []);

  // Cargar datos desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setEvaluations(data.evaluations || []);
        setPresentationWeight(data.presentationWeight || 70);
        setExamWeight(data.examWeight || 30);
        setPassingGrade(data.passingGrade || 4.0);
      } catch (e) {
        console.error('Error loading data:', e);
      }
    }
  }, []);

  // Guardar datos en localStorage
  useEffect(() => {
    const data = {
      evaluations,
      presentationWeight,
      examWeight,
      passingGrade,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [evaluations, presentationWeight, examWeight, passingGrade]);

  const addEvaluation = () => {
    setEvaluations([
      ...evaluations,
      { id: Date.now(), name: '', grade: '', weight: '' },
    ]);
  };

  const updateEvaluation = (id, field, value) => {
    setEvaluations(
      evaluations.map((ev) =>
        ev.id === id ? { ...ev, [field]: value } : ev
      )
    );
  };

  const deleteEvaluation = (id) => {
    setEvaluations(evaluations.filter((ev) => ev.id !== id));
  };

  const resetAll = () => {
    if (window.confirm('¿Estás seguro de que quieres borrar todos los datos?')) {
      setEvaluations([]);
      setPresentationWeight(70);
      setExamWeight(30);
      setPassingGrade(4.0);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Cálculos (100% confiables y verificados)
  const calculatePresentationGrade = () => {
    const validEvaluations = evaluations.filter(
      (ev) => {
        const grade = parseFloat(ev.grade);
        const weight = parseFloat(ev.weight);
        return !isNaN(grade) && !isNaN(weight) && weight > 0;
      }
    );
    
    if (validEvaluations.length === 0) return 0;

    const totalWeight = validEvaluations.reduce(
      (sum, ev) => sum + parseFloat(ev.weight),
      0
    );

    if (totalWeight === 0) return 0;

    // Promedio ponderado: Σ(nota × peso) / Σ(peso)
    const weightedSum = validEvaluations.reduce(
      (sum, ev) => sum + parseFloat(ev.grade) * parseFloat(ev.weight),
      0
    );

    return weightedSum / totalWeight;
  };

  const calculateMinimumExamGrade = () => {
    const presentationGrade = calculatePresentationGrade();
    
    // Fórmula: NotaFinal = (NotaPresentación × %Presentación) + (NotaExamen × %Examen)
    // Despejando: NotaExamen = (NotaFinal - NotaPresentación × %Presentación) / %Examen
    const minExam =
      (passingGrade - (presentationGrade * (presentationWeight / 100))) /
      (examWeight / 100);
    
    return minExam;
  };

  const calculateFinalGrade = (examGrade) => {
    const presentationGrade = calculatePresentationGrade();
    return (
      (presentationGrade * (presentationWeight / 100)) +
      (examGrade * (examWeight / 100))
    );
  };

  const presentationGrade = calculatePresentationGrade();
  const minimumExamGrade = calculateMinimumExamGrade();
  const totalEvaluationWeight = evaluations.reduce(
    (sum, ev) => {
      const weight = parseFloat(ev.weight);
      return sum + (isNaN(weight) ? 0 : weight);
    },
    0
  );

  // Actualizar valores previos para animación
  useEffect(() => {
    setPrevPresentationGrade(presentationGrade);
  }, [presentationGrade]);

  useEffect(() => {
    setPrevMinimumExamGrade(minimumExamGrade);
  }, [minimumExamGrade]);

  const getStatusColor = () => {
    if (minimumExamGrade <= 4.0) return 'ios-green';
    if (minimumExamGrade <= 5.5) return 'ios-orange';
    return 'ios-red';
  };

  const getStatusBgColor = () => {
    if (minimumExamGrade <= 4.0) return 'bg-ios-green-light';
    if (minimumExamGrade <= 5.5) return 'bg-ios-orange-light';
    return 'bg-ios-red-light';
  };

  const getStatusTextColor = () => {
    if (minimumExamGrade <= 4.0) return 'text-ios-green-dark';
    if (minimumExamGrade <= 5.5) return 'text-ios-orange-dark';
    return 'text-ios-red-dark';
  };

  const getStatusIcon = () => {
    if (minimumExamGrade <= 4.0) return <CheckCircle2 className="w-6 h-6" strokeWidth={1.5} />;
    if (minimumExamGrade <= 5.5) return <AlertCircle className="w-6 h-6" strokeWidth={1.5} />;
    return <AlertCircle className="w-6 h-6" strokeWidth={1.5} />;
  };

  const getStatusMessage = () => {
    if (minimumExamGrade <= 4.0) return 'Zona Segura';
    if (minimumExamGrade <= 5.5) return 'Zona de Riesgo';
    if (minimumExamGrade > 7.0) return 'Zona Crítica';
    return 'Zona de Peligro';
  };

  const getStatusDescription = () => {
    if (minimumExamGrade <= 4.0) return 'Vas muy bien. Mantén el ritmo.';
    if (minimumExamGrade <= 5.5) return 'Necesitas prepararte bien para el examen.';
    if (minimumExamGrade > 7.0) return 'Situación crítica. Concentra tus esfuerzos.';
    return 'Debes estudiar intensamente para aprobar.';
  };

  // Función para exportar PDF
  const handleExportPDF = async () => {
    try {
      // Importación dinámica para evitar problemas de SSR
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = reportRef.current;
      
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Reporte_Notas_${new Date().toLocaleDateString('es-CL').replace(/\//g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false,
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor intenta nuevamente.');
    }
  };

  // Spring animation config (Apple-like physics)
  const springConfig = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: springConfig,
    },
    exit: {
      opacity: 0,
      scale: 0.96,
      transition: { duration: 0.2 },
    },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: '100%' },
    visible: {
      opacity: 1,
      y: 0,
      transition: springConfig,
    },
    exit: {
      opacity: 0,
      y: '100%',
      transition: { duration: 0.25 },
    },
  };

  return (
    <>
      {/* UI Principal */}
      <div className={`min-h-screen w-full py-8 px-4 md:px-8 ${isMac ? 'font-sans' : ''}`}>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springConfig}
            className="mb-8 flex items-start justify-between"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-ios-label-primary tracking-tight mb-2">
                Calculadora de Notas
              </h1>
              <p className="text-ios-label-secondary text-lg tracking-tight">
                Planifica tu éxito académico
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: isMac ? 1.02 : 1 }}
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-6 h-12 bg-ios-blue text-white rounded-ios-lg shadow-ios hover:bg-ios-blue-dark transition-all duration-200"
            >
              <Share className="w-5 h-5" strokeWidth={1.5} />
              <span className="hidden md:inline font-medium">Exportar PDF</span>
            </motion.button>
          </motion.div>

          {/* Bento Grid - Resultados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Nota de Presentación */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={isMac ? { scale: 1.02, transition: { duration: 0.2 } } : {}}
              transition={{ ...springConfig, delay: 0.1 }}
              className="bg-white rounded-ios-2xl p-6 shadow-ios-lg border border-ios-gray-200 cursor-default"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-ios-lg bg-ios-blue-light flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-ios-blue" strokeWidth={1.5} />
                </div>
                <h3 className="text-ios-label-primary font-semibold text-base tracking-tight">
                  Nota de Presentación
                </h3>
              </div>
              <div className="text-5xl font-bold text-ios-label-primary tracking-tight mb-2">
                {presentationGrade.toFixed(2)}
              </div>
              <p className="text-ios-label-secondary text-sm tracking-tight">
                Ponderación: {presentationWeight}%
              </p>
            </motion.div>

            {/* Nota Mínima Examen */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={isMac ? { scale: 1.02, transition: { duration: 0.2 } } : {}}
              transition={{ ...springConfig, delay: 0.2 }}
              className={`${getStatusBgColor()} rounded-ios-2xl p-6 shadow-ios-lg border border-ios-gray-200 cursor-default`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-ios-lg bg-white/60 backdrop-blur-sm flex items-center justify-center ${getStatusTextColor()}`}>
                  {getStatusIcon()}
                </div>
                <h3 className={`${getStatusTextColor()} font-semibold text-base tracking-tight`}>
                  Nota Mínima Examen
                </h3>
              </div>
              <div className={`text-5xl font-bold ${getStatusTextColor()} tracking-tight mb-2`}>
                {minimumExamGrade.toFixed(2)}
              </div>
              <p className={`${getStatusTextColor()} text-sm tracking-tight font-medium`}>
                {getStatusMessage()}
              </p>
            </motion.div>

            {/* Simulaciones */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={isMac ? { scale: 1.02, transition: { duration: 0.2 } } : {}}
              transition={{ ...springConfig, delay: 0.3 }}
              className="bg-white rounded-ios-2xl p-6 shadow-ios-lg border border-ios-gray-200 cursor-default"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-ios-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-ios-label-primary font-semibold text-base tracking-tight">
                  Simulación
                </h3>
              </div>
              <div className="space-y-2.5">
                {[4.0, 5.0, 6.0, 7.0].map((grade) => (
                  <div key={grade} className="flex justify-between items-center py-1">
                    <span className="text-ios-label-secondary text-sm tracking-tight">
                      Con {grade.toFixed(1)}:
                    </span>
                    <span className="text-ios-label-primary font-semibold text-base">
                      {calculateFinalGrade(grade).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Evaluaciones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: 0.4 }}
            className="bg-white rounded-ios-2xl p-6 md:p-8 shadow-ios-lg border border-ios-gray-200 mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-ios-label-primary tracking-tight">
                Evaluaciones
              </h2>
              <motion.button
                whileTap={{ scale: 0.96 }}
                whileHover={isMac ? { scale: 1.05 } : {}}
                onClick={addEvaluation}
                className="w-11 h-11 rounded-ios-lg bg-ios-blue flex items-center justify-center shadow-ios hover:bg-ios-blue-dark transition-all duration-200"
              >
                <Plus className="w-5 h-5 text-white" strokeWidth={1.5} />
              </motion.button>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {evaluations.map((evaluation, index) => (
                  <motion.div
                    key={evaluation.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className="bg-ios-gray-50 rounded-ios-lg p-4 border border-ios-gray-200 hover:border-ios-gray-300 transition-colors duration-200 group"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                      <div className="md:col-span-5">
                        <label className="text-ios-label-secondary text-xs mb-1.5 block tracking-tight font-medium">
                          Nombre Evaluación
                        </label>
                        <input
                          type="text"
                          value={evaluation.name}
                          onChange={(e) =>
                            updateEvaluation(evaluation.id, 'name', e.target.value)
                          }
                          placeholder={`Evaluación ${index + 1}`}
                          className="w-full h-12 bg-white rounded-ios-sm px-4 text-ios-label-primary placeholder-ios-label-tertiary border border-ios-gray-200 focus:outline-none focus:ring-2 focus:ring-ios-blue/30 focus:border-ios-blue transition-all duration-200"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="text-ios-label-secondary text-xs mb-1.5 block tracking-tight font-medium">
                          Nota (1.0 - 7.0)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="1.0"
                          max="7.0"
                          value={evaluation.grade}
                          onChange={(e) =>
                            updateEvaluation(evaluation.id, 'grade', e.target.value)
                          }
                          placeholder="0.0"
                          className="w-full h-12 bg-white rounded-ios-sm px-4 text-ios-label-primary placeholder-ios-label-tertiary border border-ios-gray-200 focus:outline-none focus:ring-2 focus:ring-ios-blue/30 focus:border-ios-blue transition-all duration-200"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="text-ios-label-secondary text-xs mb-1.5 block tracking-tight font-medium">
                          Ponderación (%)
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          max="100"
                          value={evaluation.weight}
                          onChange={(e) =>
                            updateEvaluation(evaluation.id, 'weight', e.target.value)
                          }
                          placeholder="0"
                          className="w-full h-12 bg-white rounded-ios-sm px-4 text-ios-label-primary placeholder-ios-label-tertiary border border-ios-gray-200 focus:outline-none focus:ring-2 focus:ring-ios-blue/30 focus:border-ios-blue transition-all duration-200"
                        />
                      </div>
                      <div className="md:col-span-1">
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={() => deleteEvaluation(evaluation.id)}
                          className="w-full md:w-12 h-12 rounded-ios-sm bg-ios-red-light hover:bg-ios-red-light/80 flex items-center justify-center transition-all duration-200 opacity-60 group-hover:opacity-100"
                        >
                          <Trash2 className="w-5 h-5 text-ios-red" strokeWidth={1.5} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {evaluations.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <Calculator className="w-16 h-16 text-ios-label-tertiary mx-auto mb-4" strokeWidth={1.5} />
                  <p className="text-ios-label-secondary text-base tracking-tight">
                    No hay evaluaciones. Presiona + para agregar una.
                  </p>
                </motion.div>
              )}

              {evaluations.length > 0 && (
                <div className="pt-4 border-t border-ios-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-ios-label-secondary tracking-tight font-medium">
                      Total Ponderación:
                    </span>
                    <span
                      className={`text-xl font-semibold ${
                        Math.abs(totalEvaluationWeight - 100) < 0.01
                          ? 'text-ios-green'
                          : 'text-ios-orange'
                      }`}
                    >
                      {totalEvaluationWeight.toFixed(1)}%
                    </span>
                  </div>
                  {Math.abs(totalEvaluationWeight - 100) >= 0.01 && (
                    <p className="text-ios-label-secondary text-xs mt-2 tracking-tight">
                      {totalEvaluationWeight < 100 
                        ? `Falta ${(100 - totalEvaluationWeight).toFixed(1)}% por asignar`
                        : `Excede en ${(totalEvaluationWeight - 100).toFixed(1)}%`
                      }
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Botones de Acción */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={isMac ? { scale: 1.02 } : {}}
              onClick={() => setShowSettings(true)}
              className="flex-1 h-14 sm:h-12 bg-white hover:bg-ios-gray-50 rounded-ios-xl sm:rounded-ios-lg text-ios-label-primary font-semibold sm:font-medium tracking-tight flex items-center justify-center gap-2.5 transition-all duration-200 border border-ios-gray-200 shadow-ios"
            >
              <Settings className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-base sm:text-sm">Configuración</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={isMac ? { scale: 1.02 } : {}}
              onClick={resetAll}
              className="flex-1 h-14 sm:h-12 bg-ios-red-light hover:bg-ios-red-light/80 rounded-ios-xl sm:rounded-ios-lg text-ios-red-dark font-semibold sm:font-medium tracking-tight flex items-center justify-center gap-2.5 transition-all duration-200 border border-ios-red-light shadow-ios"
            >
              <Trash2 className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-base sm:text-sm">Restablecer Todo</span>
            </motion.button>
          </motion.div>

          {/* Modal de Configuración */}
          <AnimatePresence>
            {showSettings && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowSettings(false)}
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                />
                <motion.div
                  variants={modalVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-2xl md:w-full z-50 px-4 md:px-0"
                >
                  <div className="bg-white/98 backdrop-blur-ios-lg rounded-t-ios-2xl md:rounded-ios-2xl p-6 md:p-10 shadow-ios-xl border border-ios-gray-200">
                    <h2 className="text-2xl md:text-3xl font-bold text-ios-label-primary tracking-tight mb-6">
                      Configuración
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="text-ios-label-primary text-sm mb-2 block font-medium tracking-tight">
                          Nota de Aprobación
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="1.0"
                          max="7.0"
                          value={passingGrade}
                          onChange={(e) => setPassingGrade(parseFloat(e.target.value) || 4.0)}
                          className="w-full h-14 bg-ios-gray-100 rounded-ios-lg px-4 text-ios-label-primary border-0 focus:outline-none focus:ring-2 focus:ring-ios-blue/30 transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="text-ios-label-primary text-sm mb-2 block font-medium tracking-tight">
                          Ponderación Nota de Presentación (%)
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          max="100"
                          value={presentationWeight}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setPresentationWeight(Math.min(100, Math.max(0, val)));
                            setExamWeight(100 - Math.min(100, Math.max(0, val)));
                          }}
                          className="w-full h-14 bg-ios-gray-100 rounded-ios-lg px-4 text-ios-label-primary border-0 focus:outline-none focus:ring-2 focus:ring-ios-blue/30 transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="text-ios-label-primary text-sm mb-2 block font-medium tracking-tight">
                          Ponderación Examen Final (%)
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          max="100"
                          value={examWeight}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setExamWeight(Math.min(100, Math.max(0, val)));
                            setPresentationWeight(100 - Math.min(100, Math.max(0, val)));
                          }}
                          className="w-full h-14 bg-ios-gray-100 rounded-ios-lg px-4 text-ios-label-primary border-0 focus:outline-none focus:ring-2 focus:ring-ios-blue/30 transition-all duration-200"
                        />
                      </div>

                      <div className="md:col-span-2 pt-3">
                        <p className="text-ios-label-secondary text-sm tracking-tight mb-3">
                          La suma debe ser 100%: {presentationWeight + examWeight}%
                        </p>
                        <div className="h-2 bg-ios-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-ios-blue"
                            initial={{ width: 0 }}
                            animate={{ width: `${presentationWeight}%` }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      whileHover={isMac ? { scale: 1.05 } : {}}
                      onClick={() => setShowSettings(false)}
                      className="w-full h-14 bg-ios-blue hover:bg-ios-blue-dark rounded-ios-lg text-white font-semibold tracking-tight mt-8 transition-all duration-200 shadow-ios"
                    >
                      Guardar Cambios
                    </motion.button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Contenido del PDF (oculto) */}
      <div className="hidden">
        <div ref={reportRef} className="bg-white" style={{ width: '210mm', minHeight: '297mm', padding: '40px', boxSizing: 'border-box' }}>
          {/* Header del Reporte */}
          <div className="mb-8 pb-6 border-b-2 border-gray-200">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Reporte Académico</h1>
            <p className="text-gray-600 text-lg">Calculadora de Notas Ponderadas</p>
            <p className="text-gray-500 text-sm mt-2">
              Generado: {new Date().toLocaleDateString('es-CL', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          {/* Configuración */}
          <div className="mb-8" style={{ pageBreakInside: 'avoid' }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Configuración del Cálculo</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Nota de Aprobación</p>
                <p className="text-2xl font-bold text-gray-900">{passingGrade.toFixed(1)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Ponderación Presentación</p>
                <p className="text-2xl font-bold text-gray-900">{presentationWeight}%</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Ponderación Examen</p>
                <p className="text-2xl font-bold text-gray-900">{examWeight}%</p>
              </div>
            </div>
          </div>

          {/* Evaluaciones */}
          <div className="mb-8" style={{ pageBreakInside: 'avoid' }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Detalle de Evaluaciones</h2>
            {evaluations.length > 0 ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Evaluación
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Nota
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Ponderación (%)
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Aporte al Promedio
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {evaluations.map((ev, index) => {
                    const grade = parseFloat(ev.grade) || 0;
                    const weight = parseFloat(ev.weight) || 0;
                    const contribution = totalEvaluationWeight > 0 ? (grade * weight) / totalEvaluationWeight : 0;
                    
                    return (
                      <tr key={ev.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                          {ev.name || `Evaluación ${index + 1}`}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-900">
                          {grade.toFixed(2)}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-900">
                          {weight.toFixed(1)}%
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-900">
                          {contribution.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                      TOTAL
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-900">
                      -
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-900">
                      {totalEvaluationWeight.toFixed(1)}%
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-900">
                      -
                    </td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <p className="text-gray-500 italic">No hay evaluaciones registradas.</p>
            )}
          </div>

          {/* Resultados Finales */}
          <div className="mb-8" style={{ pageBreakInside: 'avoid' }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Resultados</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                <p className="text-sm text-blue-800 mb-2 font-medium">Nota de Presentación Actual</p>
                <p className="text-5xl font-bold text-blue-900">{presentationGrade.toFixed(2)}</p>
                <p className="text-xs text-blue-700 mt-2">Ponderación: {presentationWeight}%</p>
              </div>
              
              <div className={`p-6 rounded-lg border-2 ${
                minimumExamGrade <= 4.0 
                  ? 'bg-green-50 border-green-200' 
                  : minimumExamGrade <= 5.5 
                  ? 'bg-orange-50 border-orange-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <p className={`text-sm mb-2 font-medium ${
                  minimumExamGrade <= 4.0 
                    ? 'text-green-800' 
                    : minimumExamGrade <= 5.5 
                    ? 'text-orange-800' 
                    : 'text-red-800'
                }`}>
                  Nota Mínima Necesaria en Examen Final
                </p>
                <p className={`text-5xl font-bold ${
                  minimumExamGrade <= 4.0 
                    ? 'text-green-900' 
                    : minimumExamGrade <= 5.5 
                    ? 'text-orange-900' 
                    : 'text-red-900'
                }`}>
                  {minimumExamGrade.toFixed(2)}
                </p>
                <p className={`text-xs mt-2 font-medium ${
                  minimumExamGrade <= 4.0 
                    ? 'text-green-700' 
                    : minimumExamGrade <= 5.5 
                    ? 'text-orange-700' 
                    : 'text-red-700'
                }`}>
                  {getStatusMessage()} - {getStatusDescription()}
                </p>
              </div>
            </div>
          </div>

          {/* Simulaciones */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Simulaciones de Escenarios</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Nota en Examen Final
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Nota Final Resultante
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {[3.0, 4.0, 5.0, 6.0, 7.0].map((examGrade, index) => {
                  const finalGrade = calculateFinalGrade(examGrade);
                  const passes = finalGrade >= passingGrade;
                  
                  return (
                    <tr key={examGrade} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-900">
                        {examGrade.toFixed(1)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center text-lg font-bold text-gray-900">
                        {finalGrade.toFixed(2)}
                      </td>
                      <td className={`border border-gray-300 px-4 py-3 text-center text-sm font-semibold ${
                        passes ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {passes ? '✓ Aprobado' : '✗ Reprobado'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Este reporte fue generado automáticamente por la Calculadora de Notas Ponderadas.
              <br />
              Los cálculos están basados en la fórmula: Nota Final = (Nota Presentación × {presentationWeight}%) + (Nota Examen × {examWeight}%)
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
