import React from 'react'
import { Home, ShieldCheck, Database, Code2 } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-top-row">
          <div className="footer-brand">
            <div className="footer-logo">
              <Home size={18} className="text-emerald" />
              <span>California House Price Predictor</span>
            </div>
            <p className="footer-desc">
              High-performance real-estate valuation interface powered by Scikit-Learn Random Forest
              regressor and FastAPI.
            </p>
          </div>

          <div className="footer-specs">
            <div className="footer-spec-item">
              <Database size={15} className="text-cyan" />
              <div>
                <strong>Dataset:</strong>
                <span>20,640 CA Census Blocks</span>
              </div>
            </div>

            <div className="footer-spec-item">
              <ShieldCheck size={15} className="text-emerald" />
              <div>
                <strong>Accuracy:</strong>
                <span>~$39,000 USD Mean Error</span>
              </div>
            </div>

            <div className="footer-spec-item">
              <Code2 size={15} className="text-amber" />
              <div>
                <strong>Endpoints:</strong>
                <span>/health • /predict • /predict-file</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom-row">
          <p className="footer-disclaimer">
            Disclaimer: Estimates represent median block group statistical values and do not constitute
            official financial appraisals or guarantees.
          </p>
          <p className="footer-credit">
            California Real Estate AI Platform • Ready to Deploy
          </p>
        </div>
      </div>
    </footer>
  )
}
