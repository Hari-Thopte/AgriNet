import React from 'react';
import { useTranslation } from 'react-i18next';
import './FarmScene.css';

function Cloud({ className }) {
  return (
    <div className={`farm-cloud ${className}`}>
      <span />
      <span />
      <span />
    </div>
  );
}

function Crop({ index }) {
  return (
    <span className="farm-crop" style={{ '--crop-delay': `${index * -0.16}s` }}>
      <i className="farm-leaf farm-leaf-left" />
      <i className="farm-leaf farm-leaf-right" />
      <i className="farm-grain" />
    </span>
  );
}

export default function FarmScene({ className = '', showInsights = true }) {
  const { t } = useTranslation();

  return (
    <div className={`farm-scene ${className}`} aria-hidden="true">
      <div className="farm-sun"><span /></div>
      <Cloud className="farm-cloud-one" />
      <Cloud className="farm-cloud-two" />

      <div className="farm-birds"><span>⌁</span><span>⌁</span></div>
      <div className="farm-hill farm-hill-back" />
      <div className="farm-hill farm-hill-front" />

      <div className="farm-silo">
        <span className="farm-silo-top" />
        <span className="farm-silo-body" />
        <i /><i /><i />
      </div>

      <div className="farm-barn">
        <span className="farm-barn-roof" />
        <span className="farm-barn-body">
          <i className="farm-barn-door" />
          <i className="farm-barn-window" />
        </span>
      </div>

      <div className="farm-windmill">
        <span className="farm-windmill-pole" />
        <span className="farm-windmill-rotor">
          <i /><i /><i /><i />
          <b />
        </span>
      </div>

      <div className="farm-field">
        <span className="farm-row farm-row-one" />
        <span className="farm-row farm-row-two" />
        <span className="farm-row farm-row-three" />
        <span className="farm-row farm-row-four" />
        <div className="farm-crops">
          {Array.from({ length: 13 }, (_, index) => <Crop key={index} index={index} />)}
        </div>
      </div>

      <div className="farm-tractor">
        <span className="tractor-pipe" />
        <span className="tractor-cabin"><i /></span>
        <span className="tractor-hood" />
        <span className="tractor-wheel tractor-wheel-big"><i /></span>
        <span className="tractor-wheel tractor-wheel-small"><i /></span>
      </div>

      {showInsights && (
        <>
          <div className="farm-insight farm-insight-water">
            <span>💧</span>
            <div><b>{t('soilMoistureLayer')}</b><small>{t('optimal')} · {t('liveData')}</small></div>
          </div>
          <div className="farm-insight farm-insight-growth">
            <span>↗</span>
            <div><b>{t('cropHealthAvg')}</b><small>{t('healthy')}</small></div>
          </div>
        </>
      )}
    </div>
  );
}
