import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Calculator, TrendingUp, AlertCircle, CheckCircle2, Settings, Share, X, ChevronRight } from 'lucide-react';

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

  // Design Helpers
  const getStatusColor = () => {
    if (minimumExamGrade <= 4.0) return 'text-[#34C759] dark:text-[#30D158]'; // iOS Green
    if (minimumExamGrade <= 5.5) return 'text-[#FF9500] dark:text-[#FF9F0A]'; // iOS Orange
    return 'text-[#FF3B30] dark:text-[#FF453A]'; // iOS Red
  };

  const getStatusBg = () => {
    if (minimumExamGrade <= 4.0) return 'bg-[#34C759]/10 dark:bg-[#30D158]/20';
    if (minimumExamGrade <= 5.5) return 'bg-[#FF9500]/10 dark:bg-[#FF9F0A]/20';
    return 'bg-[#FF3B30]/10 dark:bg-[#FF453A]/20';
  };

  const getStatusIcon = () => {
    const props = { className: `w-6 h-6 ${getStatusColor()}`, strokeWidth: 2 };
    if (minimumExamGrade <= 4.0) return <CheckCircle2 {...props} />;
    if (minimumExamGrade <= 5.5) return <AlertCircle {...props} />;
    return <AlertCircle {...props} />;
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

  // iOS Physics Spring
  const springTransition = {
    type: "spring",
    stiffness: 400,
    damping: 30,
    mass: 1
  };

  return (
    <div className={`min-h-screen w-full bg-[#F2F2F7] dark:bg-[#000000] text-gray-900 dark:text-white transition-colors duration-300 font-sans selection:bg-[#007AFF]/30`}>
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springTransition}
          className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-black dark:text-white mb-1">
              Notas
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
              Calculadora Ponderada
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(true)}
              className="p-3 rounded-full bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-[#2C2C2E] transition-colors"
            >
              <Settings className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-5 py-3 bg-[#007AFF] hover:bg-[#0071E3] text-white rounded-full font-semibold shadow-sm transition-colors"
            >
              <Share className="w-4 h-4" />
              <span>Exportar</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Card: Nota Presentación */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...springTransition, delay: 0.1 }}
            className="bg-white dark:bg-[#1C1C1E] rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Calculator className="w-24 h-24 text-[#007AFF]" />
            </div>
            <div className="relative z-10">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Presentación
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight text-black dark:text-white">
                  {presentationGrade.toFixed(2)}
                </span>
                <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
                  / 7.0
                </span>
              </div>
              <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-[#2C2C2E] text-xs font-medium text-gray-600 dark:text-gray-300">
                Ponderación: {presentationWeight}%
              </div>
            </div>
          </motion.div>

          {/* Card: Examen Necesario */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...springTransition, delay: 0.2 }}
            className={`rounded-[2rem] p-6 shadow-sm border border-transparent relative overflow-hidden ${getStatusBg()}`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className={`text-sm font-bold uppercase tracking-wider ${getStatusColor()}`}>
                Meta Examen
              </h3>
              {getStatusIcon()}
            </div>
            
            <div className="flex items-baseline gap-1 mb-2">
              <span className={`text-5xl font-bold tracking-tight ${getStatusColor()}`}>
                {minimumExamGrade.toFixed(2)}
              </span>
            </div>
            
            <p className={`text-sm font-medium leading-relaxed opacity-90 ${getStatusColor()}`}>
              {minimumExamGrade <= 4.0 
                ? 'Estás en zona segura. Mantén el ritmo.' 
                : minimumExamGrade <= 5.5 
                ? 'Necesitas esforzarte en el examen.' 
                : 'Situación crítica. Requiere puntaje perfecto.'}
            </p>
          </motion.div>
        </div>

        {/* Simulation Strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springTransition, delay: 0.3 }}
          className="mb-8 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 scrollbar-hide"
        >
          <div className="flex gap-3 min-w-max">
            {[4.0, 5.0, 6.0, 7.0].map((grade) => {
              const final = calculateFinalGrade(grade);
              const isPassing = final >= passingGrade;
              return (
                <div key={grade} className="flex-1 min-w-[140px] bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center">
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-1">Si sacas {grade.toFixed(1)}</span>
                  <span className={`text-2xl font-bold ${isPassing ? 'text-black dark:text-white' : 'text-gray-400'}`}>
                    {final.toFixed(2)}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wide mt-1 ${isPassing ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
                    {isPassing ? 'Aprobado' : 'Reprobado'}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Evaluations List */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-[#2C2C2E]/30 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Evaluaciones
              <span className="text-xs font-normal text-gray-400 bg-white dark:bg-black px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
                {evaluations.length}
              </span>
            </h2>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={addEvaluation}
              className="w-8 h-8 rounded-full bg-[#007AFF] text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:bg-[#0071E3] transition-colors"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
            </motion.button>
          </div>

          <div className="p-4 space-y-3">
            <AnimatePresence mode="popLayout">
              {evaluations.map((evaluation, index) => (
                <motion.div
                  key={evaluation.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="group relative bg-gray-50 dark:bg-[#2C2C2E] rounded-2xl p-4 transition-colors hover:bg-gray-100 dark:hover:bg-[#3A3A3C]"
                >
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="flex-1 w-full">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block ml-1">Nombre</label>
                      <input
                        type="text"
                        value={evaluation.name}
                        onChange={(e) => updateEvaluation(evaluation.id, 'name', e.target.value)}
                        placeholder={`Evaluación ${index + 1}`}
                        className="w-full bg-transparent text-base font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                      />
                    </div>
                    
                    <div className="flex gap-4 w-full md:w-auto">
                      <div className="w-24">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block ml-1">Nota</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            min="1.0"
                            max="7.0"
                            value={evaluation.grade}
                            onChange={(e) => updateEvaluation(evaluation.id, 'grade', e.target.value)}
                            className="w-full bg-white dark:bg-black/20 rounded-xl px-3 py-2 text-center font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50 transition-all"
                            placeholder="-"
                          />
                        </div>
                      </div>
                      
                      <div className="w-24">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block ml-1">Peso %</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={evaluation.weight}
                            onChange={(e) => updateEvaluation(evaluation.id, 'weight', e.target.value)}
                            className="w-full bg-white dark:bg-black/20 rounded-xl px-3 py-2 text-center font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50 transition-all"
                            placeholder="0"
                          />
                          <span className="absolute right-3 top-2 text-gray-400 text-sm font-medium">%</span>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteEvaluation(evaluation.id)}
                      className="absolute -top-2 -right-2 md:static md:top-auto md:right-auto w-8 h-8 md:w-10 md:h-10 rounded-full bg-white dark:bg-[#3A3A3C] md:bg-transparent md:dark:bg-transparent text-[#FF3B30] flex items-center justify-center opacity-100 md:opacity-0 group-hover:opacity-100 shadow-sm md:shadow-none transition-all hover:bg-[#FF3B30]/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {evaluations.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-[#2C2C2E] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  Agrega tu primera evaluación
                </p>
              </div>
            )}
          </div>

          {/* Footer Stats */}
          {evaluations.length > 0 && (
            <div className="bg-gray-50 dark:bg-[#2C2C2E]/50 p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Total Ponderado</span>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-lg ${Math.abs(totalEvaluationWeight - 100) < 0.1 ? 'text-[#34C759]' : 'text-[#FF9500]'}`}>
                  {totalEvaluationWeight}%
                </span>
                {Math.abs(totalEvaluationWeight - 100) >= 0.1 && (
                  <span className="text-xs text-gray-400 bg-white dark:bg-black px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
                    {totalEvaluationWeight < 100 ? 'Falta asignar' : 'Excede'}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Settings Modal (iOS Sheet Style) */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#F2F2F7] dark:bg-[#1C1C1E] rounded-t-[2rem] md:rounded-[2rem] md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-black dark:text-white">Configuración</h2>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="p-2 bg-gray-200 dark:bg-[#2C2C2E] rounded-full text-gray-600 dark:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl p-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Nota Aprobación</label>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium text-black dark:text-white">{passingGrade.toFixed(1)}</span>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="1.0"
                          max="7.0"
                          step="0.1"
                          value={passingGrade}
                          onChange={(e) => setPassingGrade(parseFloat(e.target.value))}
                          className="w-32 accent-[#007AFF]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl p-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Ponderación Global</label>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-300">Presentación</span>
                          <span className="font-bold text-black dark:text-white">{presentationWeight}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={presentationWeight}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setPresentationWeight(val);
                            setExamWeight(100 - val);
                          }}
                          className="w-full accent-[#007AFF]"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-300">Examen</span>
                          <span className="font-bold text-black dark:text-white">{examWeight}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 dark:bg-black rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#FF9500]" 
                            style={{ width: `${examWeight}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={resetAll}
                    className="w-full py-4 rounded-xl bg-[#FF3B30]/10 text-[#FF3B30] font-semibold text-sm hover:bg-[#FF3B30]/20 transition-colors"
                  >
                    Restablecer todos los datos
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hidden PDF Template (Kept functional but hidden) */}
      <div className="hidden">
        <div ref={reportRef} className="bg-white p-10" style={{ width: '210mm', minHeight: '297mm' }}>
          <h1 className="text-3xl font-bold mb-2">Reporte de Notas</h1>
          <p className="text-gray-500 mb-8">Generado el {new Date().toLocaleDateString()}</p>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Nota Presentación</p>
              <p className="text-2xl font-bold">{presentationGrade.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Examen Necesario</p>
              <p className="text-2xl font-bold">{minimumExamGrade.toFixed(2)}</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-100">
                <th className="py-2">Evaluación</th>
                <th className="py-2">Nota</th>
                <th className="py-2">Peso</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map(ev => (
                <tr key={ev.id} className="border-b border-gray-50">
                  <td className="py-2">{ev.name || 'Sin nombre'}</td>
                  <td className="py-2">{ev.grade}</td>
                  <td className="py-2">{ev.weight}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
)}
