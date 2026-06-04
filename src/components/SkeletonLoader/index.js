import React from 'react';
import './SkeletonLoader.css';

/**
 * SkeletonLoader — generic shimmer placeholder components.
 *
 * Usage:
 *   <SkeletonLoader.Line width="60%" />
 *   <SkeletonLoader.Block height={120} />
 *   <SkeletonLoader.Card />
 *   <SkeletonLoader.Avatar size={40} />
 *   <SkeletonLoader.Text lines={3} />
 *   <SkeletonLoader.MetricCard />
 *   <SkeletonLoader.ChartBlock />
 *   <SkeletonLoader.TableRow />
 */

function Line({ width = '100%', height = 14, className = '' }) {
  return (
    <div
      className={`skeleton skeleton--line ${className}`}
      style={{ width, height, borderRadius: height }}
      aria-hidden="true"
    />
  );
}

function Block({ width = '100%', height = 100, radius = 8, className = '' }) {
  return (
    <div
      className={`skeleton skeleton--block ${className}`}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

function Avatar({ size = 40, className = '' }) {
  return (
    <div
      className={`skeleton skeleton--avatar ${className}`}
      style={{ width: size, height: size, borderRadius: '50%' }}
      aria-hidden="true"
    />
  );
}

function Text({ lines = 3, className = '' }) {
  const widths = ['100%', '85%', '70%', '90%', '60%'];
  return (
    <div className={`skeleton-text ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Line key={i} width={widths[i % widths.length]} height={13} />
      ))}
    </div>
  );
}

function Card({ className = '' }) {
  return (
    <div className={`skeleton-card ${className}`} aria-hidden="true">
      <div className="skeleton-card__stripe skeleton" />
      <div className="skeleton-card__body">
        <Line width="75%" height={14} />
        <Line width="55%" height={11} />
        <div className="skeleton-card__footer">
          <Block width={52} height={18} radius={999} />
          <Block width={44} height={18} radius={999} />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ className = '' }) {
  return (
    <div className={`skeleton-metric ${className}`} aria-hidden="true">
      <Avatar size={38} />
      <div className="skeleton-metric__body">
        <Line width="45%" height={28} />
        <Line width="60%" height={12} />
      </div>
    </div>
  );
}

function ChartBlock({ height = 220, className = '' }) {
  return (
    <div className={`skeleton-chart ${className}`} aria-hidden="true">
      <Line width="40%" height={14} />
      <Block width="100%" height={height} radius={8} />
    </div>
  );
}

function TableRow({ cols = 4, className = '' }) {
  return (
    <div className={`skeleton-row ${className}`} aria-hidden="true">
      {Array.from({ length: cols }).map((_, i) => (
        <Line key={i} width={i === 0 ? '35%' : '18%'} height={12} />
      ))}
    </div>
  );
}

const SkeletonLoader = { Line, Block, Avatar, Text, Card, MetricCard, ChartBlock, TableRow };
export default SkeletonLoader;
