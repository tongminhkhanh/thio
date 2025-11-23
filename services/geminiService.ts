

import { GoogleGenAI, Modality } from "@google/genai";
import { PromptDefinition } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateEducationalContent = async (
  promptDef: PromptDefinition,
  inputs: Record<string, any>
): Promise<string> => {
  
  // --- 1. HANDLE AUDIO GENERATION (TTS) ---
  if (promptDef.isAudioTool) {
    try {
      const voiceNameMap: Record<string, string> = {
        "Kore (Nữ - Truyền cảm)": "Kore",
        "Puck (Nam - Trầm ấm)": "Puck",
        "Fenrir (Nam - Mạnh mẽ)": "Fenrir",
        "Aoede (Nữ - Nhẹ nhàng)": "Aoede"
      };
      
      const isMultiSpeaker = inputs.mode && inputs.mode.includes("Hội thoại");
      let speechConfig = {};
      let promptContents = [];

      if (isMultiSpeaker) {
          const voice1 = inputs.voice ? voiceNameMap[inputs.voice] : 'Kore';
          const voice2 = inputs.voice_2 ? voiceNameMap[inputs.voice_2] : 'Puck';
          
          // Configure Multi-Speaker with fixed placeholders "Người A" and "Người B"
          // The user is instructed to use these labels in their script
          speechConfig = {
              multiSpeakerVoiceConfig: {
                  speakerVoiceConfigs: [
                      { speaker: 'Người A', voiceConfig: { prebuiltVoiceConfig: { voiceName: voice1 } } },
                      { speaker: 'Người B', voiceConfig: { prebuiltVoiceConfig: { voiceName: voice2 } } }
                  ]
              }
          };
          
          // Prepend instruction to ensure model parses conversation correctly
          promptContents = [{ parts: [{ text: `Hãy đọc cuộc hội thoại sau giữa Người A và Người B:\n\n${inputs.text}` }] }];

      } else {
          const selectedVoice = inputs.voice ? voiceNameMap[inputs.voice] : 'Kore';
          speechConfig = {
              voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: selectedVoice },
              },
          };
          promptContents = [{ parts: [{ text: inputs.text }] }];
      }
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: promptContents,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: speechConfig,
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        // Return a special marker that ActiveTool component can parse
        return `[AUDIO_DATA]:${base64Audio}`;
      } else {
        return "Không tạo được âm thanh. Vui lòng thử lại và đảm bảo kịch bản không vi phạm chính sách.";
      }

    } catch (error) {
      console.error("Gemini TTS Error:", error);
      return `**Lỗi tạo âm thanh:** ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }

  // --- 2. HANDLE IMAGE GENERATION ---
  if (promptDef.isImageTool) {
    try {
      // Enhanced Prompt Engineering for Images
      const promptText = `
        Generate a high-quality educational illustration.
        Subject: ${inputs.description}
        Style: ${inputs.style} (Professional, Artistic, Clean lines).
        Aspect Ratio: ${inputs.aspectRatio}.
        Safety: School-safe, no text, no violence, diverse characters if humans are present.
        Lighting: Bright, natural, studio lighting.
        Detail: High resolution, detailed textures.
      `;
      const aspectRatio = inputs.aspectRatio?.includes("1:1") ? "1:1" : (inputs.aspectRatio?.includes("3:4") ? "3:4" : "16:9");

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: promptText }]
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any
          }
        }
      });

      let markdownImage = "";
      if (response.candidates?.[0]?.content?.parts) {
         for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              const base64Data = part.inlineData.data;
              const mimeType = part.inlineData.mimeType || 'image/png';
              markdownImage = `![Generated Image](data:${mimeType};base64,${base64Data})`;
              // Append style info below image
              markdownImage += `\n\n> **Mô tả:** ${inputs.description}\n> **Phong cách:** ${inputs.style}`;
              return markdownImage;
            }
         }
      }
      return "Không tìm thấy dữ liệu hình ảnh trong phản hồi. Vui lòng thử lại.";
      
    } catch (error) {
       console.error("Gemini Image API Error:", error);
       return `**Lỗi tạo ảnh:** ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }

  // --- 3. HANDLE TEXT / MULTIMODAL / SEARCH / THINKING ---
  const guidelines = promptDef.content.guidelines.map(g => `- ${g}`).join('\n');
  const systemInstruction = `
    CONTEXT: Bạn là TRỢ LÝ AI TH ÍT ONG, trợ lý ảo chuyên nghiệp SỐ 1 dành cho giáo viên tại Việt Nam. Bạn am hiểu sâu sắc Chương trình Giáo dục Phổ thông 2018 (CV 2018), Công văn 5512, các kỹ thuật dạy học tích cực và tâm lý học đường.

    IDENTITY (VAI TRÒ): ${promptDef.content.role}
    
    MISSION (NHIỆM VỤ): ${promptDef.content.task}
    
    GUIDELINES (NGUYÊN TẮC BẮT BUỘC):
    ${guidelines}
    
    FORMATTING RULES (QUY TẮC TRÌNH BÀY - QUAN TRỌNG):
    1. Ngôn ngữ: 100% Tiếng Việt chuẩn mực, sư phạm, chính tả chính xác.
    2. Cấu trúc: Sử dụng Markdown chuyên nghiệp.
       - **Bảng (Tables)**: Rất quan trọng cho giáo án, ma trận, kế hoạch. Hãy kẻ bảng rõ ràng.
       - **Tiêu đề (Headings)**: Dùng ## và ### để phân cấp nội dung.
       - **Danh sách (Lists)**: Dùng bullet points để dễ đọc.
       - **Điểm nhấn**: Dùng **In đậm** cho từ khóa quan trọng.
    3. TOÁN HỌC/KHOA HỌC (BẮT BUỘC): 
       - Với các công thức toán học, lý, hóa, tuyệt đối phải dùng định dạng LaTeX.
       - Công thức trên dòng riêng: đặt trong cặp dấu $$ ... $$
       - Công thức trên cùng dòng: đặt trong cặp dấu $ ... $
       - Ví dụ: Phương trình $ax^2 + bx + c = 0$ có nghiệm là $$x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$$
    4. Phong cách: Tích cực, khuyến khích, cụ thể và thực tế. Tránh lý thuyết suông.
    5. Output: Trả lời trực tiếp vào vấn đề, không rào đón thừa thãi.
  `;

  // Dynamically construct the User Message and Parts from inputs
  let inputDetails = "";
  let contentParts: any[] = [];
  
  // Iterate over the defined inputs in the prompt definition
  promptDef.inputs.forEach(field => {
    const value = inputs[field.key];
    if (value) {
      if (typeof value === 'object' && value.inlineData) {
        // This is a file input (Multimodal)
        inputDetails += `- **[Tài liệu đính kèm]**: ${value.fileName || 'Đã tải lên'} (Hãy phân tích kỹ file này)\n`;
        contentParts.push(value.inlineData); // { mimeType: '...', data: '...' }
      } else {
        // This is a text input
        inputDetails += `- **${field.label}**: ${value}\n`;
      }
    }
  });

  const textPrompt = `
    THÔNG TIN ĐẦU VÀO CHI TIẾT:
    ${inputDetails}
    
    YÊU CẦU: Dựa trên thông tin trên, hãy thực hiện nhiệm vụ "${promptDef.title}" một cách xuất sắc nhất.
    Hãy suy nghĩ kỹ về cấu trúc, nội dung và phương pháp trước khi viết.
  `;
  
  // Add text prompt to parts
  contentParts.push({ text: textPrompt });

  try {
    // Determine Model and Config
    const modelId = 'gemini-2.5-flash'; 
    
    // Base configuration
    let config: any = {
      systemInstruction: systemInstruction,
      temperature: 0.7, 
    };

    // 3.1 Google Search Grounding
    if (promptDef.useSearch) {
       config.tools = [{ googleSearch: {} }];
    }

    // 3.2 Thinking Config (Reasoning)
    if (promptDef.useThinking) {
      // Enable Thinking for complex tasks. 
      // 8192 is a good balance for educational reasoning.
      config.thinkingConfig = { thinkingBudget: 8192 }; 
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: contentParts },
      config: config
    });

    let finalText = response.text || "";

    // If Search was used, extract and append grounding sources nicely
    if (promptDef.useSearch && response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
       const chunks = response.candidates[0].groundingMetadata.groundingChunks;
       let sourcesList = "\n\n---\n### 📚 Nguồn tham khảo tin cậy (Google Search):\n";
       let hasSources = false;
       let uniqueLinks = new Set();
       
       chunks.forEach((chunk: any) => {
         if (chunk.web?.uri && chunk.web?.title) {
            if (!uniqueLinks.has(chunk.web.uri)) {
                sourcesList += `- [${chunk.web.title}](${chunk.web.uri})\n`;
                uniqueLinks.add(chunk.web.uri);
                hasSources = true;
            }
         }
       });

       if (hasSources) {
         finalText += sourcesList;
       }
    }

    return finalText || "Xin lỗi, AI đang suy nghĩ quá lâu và chưa phản hồi. Vui lòng thử lại.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `**Lỗi kết nối hệ thống AI:**\n\nCó thể do tài liệu quá lớn, mạng không ổn định hoặc hệ thống đang quá tải.\n\nChi tiết: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
};