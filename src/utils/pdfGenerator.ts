import { jsPDF } from "jspdf";
import { AgentResponse, SimulationState } from "../types";
import { AGENTS } from "../constants";

export const generateRoyalDecreePDF = (state: SimulationState) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;
  const lineHeight = 7;

  // Helper to add centered text
  const addCenteredText = (text: string, fontSize: number, fontStyle: string = "normal") => {
    doc.setFont("times", fontStyle);
    doc.setFontSize(fontSize);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, yPos);
    yPos += lineHeight + (fontSize / 2);
  };

  // Helper to add wrapped text
  const addWrappedText = (text: string, fontSize: number = 11, fontStyle: string = "normal", indent: number = 0) => {
    doc.setFont("times", fontStyle);
    doc.setFontSize(fontSize);
    const splitText = doc.splitTextToSize(text, pageWidth - (margin * 2) - indent);
    doc.text(splitText, margin + indent, yPos);
    yPos += (splitText.length * 6) + 4; // Dynamic height based on lines
    
    // Page break check
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
  };

  const addDivider = () => {
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;
  };

  // --- DOCUMENT CONTENT ---

  // Title
  addCenteredText("SWARAJYA ASHTA PRADHAN MANDAL", 18, "bold");
  addCenteredText("ROYAL DECREE", 14, "bold");
  yPos += 5;
  addDivider();

  // Date
  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPos);
  yPos += 10;

  // Query Section
  doc.setFont("times", "bold");
  doc.text("PETITION (Query):", margin, yPos);
  yPos += 7;
  addWrappedText(state.query, 11, "italic");
  yPos += 5;

  // Ministers Section
  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.text("COUNCIL DELIBERATIONS:", margin, yPos);
  yPos += 10;

  Object.values(state.ministerResponses).forEach((response: AgentResponse) => {
    const agent = AGENTS[response.role];
    // Agent Header
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.text(`${agent.name} (${agent.title})`, margin, yPos);
    yPos += 6;

    // Summary
    addWrappedText(`"${response.summary}"`, 10, "normal", 5);
    
    // Recommendation
    addWrappedText(`Recommendation: ${response.recommendation}`, 10, "bold", 5);
    yPos += 2;
  });

  // Critique Section
  if (state.critique) {
    yPos += 5;
    const critiqueAgent = AGENTS[state.critique.role];
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.setTextColor(150, 0, 0); // Dark Red
    doc.text(`JUDICIAL REVIEW (${critiqueAgent.name}):`, margin, yPos);
    doc.setTextColor(0, 0, 0); // Reset black
    yPos += 8;
    addWrappedText(state.critique.summary, 10, "italic", 5);
    addWrappedText(`VERDICT: ${state.critique.recommendation}`, 10, "bold", 5);
  }

  // Final Decree Section (The most important part)
  if (state.finalVerdict) {
    yPos += 5;
    addDivider();
    addCenteredText("THE FINAL DECREE", 14, "bold");
    yPos += 5;
    
    // Draw a box around the final verdict
    const boxTop = yPos;
    const initialY = yPos;
    
    // Content inside box
    yPos += 5;
    addWrappedText(state.finalVerdict.recommendation, 12, "bolditalic");
    addWrappedText(state.finalVerdict.summary, 11, "normal");
    
    // Draw rect
    const boxHeight = yPos - boxTop;
    doc.setDrawColor(0);
    doc.rect(margin - 2, boxTop, pageWidth - (margin * 2) + 4, boxHeight + 2);
    
    yPos += 10;
  }

  // Seal / Footer
  yPos = 270; // Bottom of page
  addCenteredText("[ SEAL OF THE PESHWA OFFICE ]", 10, "bold");

  // Save
  doc.save("Royal_Decree_Ashta_Pradhan.pdf");
};