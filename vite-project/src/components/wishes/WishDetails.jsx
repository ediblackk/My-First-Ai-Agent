import React from 'react';
import PropTypes from 'prop-types';

const StatusBadge = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-500';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-500';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-500';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-500';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'În Așteptare';
      case 'in_progress':
        return 'În Progres';
      case 'completed':
        return 'Completată';
      case 'cancelled':
        return 'Anulată';
      default:
        return status;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
      {getStatusText()}
    </span>
  );
};

const Section = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
    <div className="px-4 py-5 sm:px-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
        {title}
      </h3>
    </div>
    <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
      {children}
    </div>
  </div>
);

const WishDetails = ({ wish, onUpdateStatus }) => {
  const {
    content,
    status,
    analysis,
    solution,
    createdAt,
    updatedAt,
    completedAt,
    aiModel,
    tokensUsed
  } = wish;

  const handleStatusChange = async (newStatus) => {
    try {
      await onUpdateStatus(newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <StatusBadge status={status} />
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Creată la: {new Date(createdAt).toLocaleString()}
          </div>
        </div>
        <div className="flex space-x-3">
          {status !== 'completed' && status !== 'cancelled' && (
            <>
              <button
                onClick={() => handleStatusChange('completed')}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Marchează Completată
              </button>
              <button
                onClick={() => handleStatusChange('cancelled')}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Anulează
              </button>
            </>
          )}
        </div>
      </div>

      {/* Conținut Dorință */}
      <Section title="Dorința Ta">
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {content}
        </p>
      </Section>

      {/* Analiză AI */}
      <Section title="Analiză">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Complexitate
            </h4>
            <div className="mt-1 flex items-center">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(analysis.complexity / 10) * 100}%` }}
                ></div>
              </div>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                {analysis.complexity}/10
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Categorii
            </h4>
            <div className="mt-1 flex flex-wrap gap-2">
              {analysis.categories.map((category, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Provocări
            </h4>
            <ul className="mt-1 list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
              {analysis.challenges.map((challenge, index) => (
                <li key={index}>{challenge}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Resurse Necesare
            </h4>
            <div className="mt-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Timp estimat: {analysis.resources.timeEstimate}
              </p>
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Abilități necesare:
                </p>
                <ul className="mt-1 list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                  {analysis.resources.skillsRequired.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Soluție */}
      <Section title="Plan de Acțiune">
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Pași de Implementare
            </h4>
            <div className="mt-2 space-y-3">
              {solution.steps.map((step, index) => (
                <div 
                  key={index}
                  className="flex items-start"
                >
                  <div className="flex-shrink-0 h-5 w-5 relative mt-1">
                    <div className="absolute w-px h-full bg-gray-300 dark:bg-gray-600 left-1/2"></div>
                    <div className="absolute w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-xs">{step.order}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {step.description}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Timp estimat: {step.timeEstimate}
                    </p>
                    {step.dependencies.length > 0 && (
                      <div className="mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Dependințe:
                        </p>
                        <ul className="list-disc list-inside text-xs text-gray-500 dark:text-gray-400">
                          {step.dependencies.map((dep, i) => (
                            <li key={i}>{dep}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Timeline
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {solution.timeline}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Riscuri și Mitigare
            </h4>
            <div className="mt-2 space-y-3">
              {solution.risks.map((risk, index) => (
                <div 
                  key={index}
                  className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md"
                >
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {risk.description}
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Mitigare: {risk.mitigation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Criterii de Succes
            </h4>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
              {solution.successCriteria.map((criteria, index) => (
                <li key={index}>{criteria}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Metadata */}
      <Section title="Informații Tehnice">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Model AI
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {aiModel}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tokeni Folosiți
            </h4>
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              <p>Analiză: {tokensUsed?.analysis || 0}</p>
              <p>Soluție: {tokensUsed?.solution || 0}</p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ultima Actualizare
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {new Date(updatedAt).toLocaleString()}
            </p>
          </div>
          {completedAt && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Completată La
              </h4>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {new Date(completedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
};

WishDetails.propTypes = {
  wish: PropTypes.shape({
    content: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['pending', 'in_progress', 'completed', 'cancelled']).isRequired,
    analysis: PropTypes.shape({
      complexity: PropTypes.number.isRequired,
      categories: PropTypes.arrayOf(PropTypes.string).isRequired,
      challenges: PropTypes.arrayOf(PropTypes.string).isRequired,
      suggestions: PropTypes.arrayOf(PropTypes.string).isRequired,
      resources: PropTypes.shape({
        timeEstimate: PropTypes.string.isRequired,
        skillsRequired: PropTypes.arrayOf(PropTypes.string).isRequired,
        toolsNeeded: PropTypes.arrayOf(PropTypes.string).isRequired
      }).isRequired
    }).isRequired,
    solution: PropTypes.shape({
      steps: PropTypes.arrayOf(PropTypes.shape({
        order: PropTypes.number.isRequired,
        description: PropTypes.string.isRequired,
        timeEstimate: PropTypes.string.isRequired,
        dependencies: PropTypes.arrayOf(PropTypes.string).isRequired
      })).isRequired,
      timeline: PropTypes.string.isRequired,
      resources: PropTypes.arrayOf(PropTypes.string).isRequired,
      risks: PropTypes.arrayOf(PropTypes.shape({
        description: PropTypes.string.isRequired,
        mitigation: PropTypes.string.isRequired
      })).isRequired,
      successCriteria: PropTypes.arrayOf(PropTypes.string).isRequired
    }).isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
    completedAt: PropTypes.string,
    aiModel: PropTypes.string.isRequired,
    tokensUsed: PropTypes.shape({
      analysis: PropTypes.number,
      solution: PropTypes.number
    })
  }).isRequired,
  onUpdateStatus: PropTypes.func.isRequired
};

export default WishDetails;
