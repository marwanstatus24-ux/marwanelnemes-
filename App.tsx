import React, { useState, useCallback } from 'react';
import type { ImageFile } from './types';
import { fileToBase64 } from './utils/fileUtils';
import { extractPromptFromImage, generateStyledImage, applyExtraEdits } from './services/geminiService';
import ImageUploadCard from './components/ImageUploadCard';
import Loader from './components/Loader';

export default function App() {
  const [styleImage, setStyleImage] = useState<ImageFile>(null);
  const [personalImage, setPersonalImage] = useState<ImageFile>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [extraEdits, setExtraEdits] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleStyleImageUpload = (file: File) => {
    setStyleImage({ file, previewUrl: URL.createObjectURL(file) });
  };

  const handlePersonalImageUpload = (file: File) => {
    setPersonalImage({ file, previewUrl: URL.createObjectURL(file) });
  };

  const handleGenerate = useCallback(async () => {
    if (!styleImage || !personalImage) {
      setError('يرجى رفع كل من صورة النمط وصورتك الشخصية.');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedPrompt('');
    setResultImage(null);

    try {
      setLoadingMessage('جاري استخراج النمط من الصورة...');
      const styleImageBase64 = await fileToBase64(styleImage.file);
      const prompt = await extractPromptFromImage(styleImageBase64);
      setGeneratedPrompt(prompt);

      setLoadingMessage('جاري تطبيق النمط على صورتك...');
      const personalImageBase64 = await fileToBase64(personalImage.file);
      const generatedImageBase64 = await generateStyledImage(
        personalImageBase64,
        personalImage.file.type,
        prompt
      );
      setResultImage(`data:image/jpeg;base64,${generatedImageBase64}`);

    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء إنشاء الصورة. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  }, [styleImage, personalImage]);

  const handleApplyExtraEdits = useCallback(async () => {
    if (!resultImage || !extraEdits) {
      setError('لا توجد صورة لتعديلها أو أن حقل التعديلات فارغ.');
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingMessage('جاري تطبيق التعديلات الإضافية...');

    try {
        const base64Data = resultImage.split(',')[1];
        const updatedImageBase64 = await applyExtraEdits(
            base64Data,
            'image/jpeg',
            extraEdits
        );
        setResultImage(`data:image/jpeg;base64,${updatedImageBase64}`);
    } catch (err) {
        console.error(err);
        setError('حدث خطأ أثناء تطبيق التعديلات. يرجى المحاولة مرة أخرى.');
    } finally {
        setLoading(false);
        setLoadingMessage('');
    }
  }, [resultImage, extraEdits]);


  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-200 to-pink-100 flex flex-col items-center p-6 w-full">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-purple-800 mb-2">Marwan Ai</h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700">توليد الصور بالذكاء الاصطناعي</h2>
        </header>

        <main className="flex flex-col items-center gap-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
             <ImageUploadCard title="ارفع صورة النمط" onImageSelect={handleStyleImageUpload} previewUrl={styleImage?.previewUrl ?? null} />
             <ImageUploadCard title="ارفع صورتك الشخصية" onImageSelect={handlePersonalImageUpload} previewUrl={personalImage?.previewUrl ?? null} />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !styleImage || !personalImage}
            className="px-8 py-4 text-lg font-bold rounded-2xl shadow-lg bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed w-full max-w-md"
          >
            {loading ? '...' : 'إنشاء الصورة'}
          </button>
          
          {error && <p className="text-red-600 bg-red-100 border border-red-500 rounded-lg p-3 text-center">{error}</p>}

          {loading && (
             <div className="flex flex-col items-center text-center p-6 bg-white/50 rounded-2xl shadow-lg">
                <Loader />
                <p className="text-lg font-semibold text-purple-800 mt-4">{loadingMessage}</p>
                <p className="text-sm text-gray-600 mt-2">سيستغرق ذلك وقتًا قصيرًا، يرجى الانتظار.</p>
             </div>
          )}
          
          {generatedPrompt && !loading && (
            <div className="w-full max-w-lg bg-white p-6 shadow-md rounded-2xl">
              <h3 className="text-xl font-bold mb-2 text-gray-800">البرومبت المستخرج من الصورة</h3>
              <textarea
                value={generatedPrompt}
                readOnly
                className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 resize-none h-28 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          )}

          {resultImage && !loading && (
            <div className="w-full max-w-lg bg-white p-6 shadow-md rounded-2xl flex flex-col items-center">
              <h3 className="text-xl font-bold mb-4 text-gray-800">النتيجة النهائية</h3>
              <img
                src={resultImage}
                alt="الصورة المُنشأة"
                className="rounded-xl shadow-md w-full h-auto"
              />
            </div>
          )}

          {resultImage && !loading && (
            <div className="w-full max-w-lg bg-white p-6 shadow-md rounded-2xl">
              <h3 className="text-xl font-bold mb-2 text-gray-800">تعديلات إضافية</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={extraEdits}
                    onChange={(e) => setExtraEdits(e.target.value)}
                    placeholder="مثال: قم بإضافة نظارة، ملابس، إلـ.ـخ"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 flex-grow"
                />
                <button
                    onClick={handleApplyExtraEdits}
                    disabled={loading || !extraEdits}
                    className="px-6 py-3 font-semibold text-white bg-pink-500 rounded-lg hover:bg-pink-600 disabled:bg-gray-400"
                >
                    تطبيق
                </button>
              </div>
            </div>
          )}
        </main>
        
        <footer className="mt-12 text-center">
            <p className="text-lg font-bold text-purple-800 mb-2">هذه الأداة بواسطة مروان النميس</p>
            <p className="text-md font-semibold text-gray-700">Marwan ElNemes</p>
        </footer>
      </div>
    </div>
  );
}