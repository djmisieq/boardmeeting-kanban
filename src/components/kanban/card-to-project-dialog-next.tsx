{
  const dept = departments.find(d => d.id === deptId);
                        return dept ? (
                          <span
                            key={deptId}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded"
                          >
                            {dept.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Tagi</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Kamienie milowe ({milestones.length})</div>
                    {milestones.length === 0 ? (
                      <div className="italic text-gray-400 dark:text-gray-500">Brak zdefiniowanych kamieni milowych</div>
                    ) : (
                      <div className="mt-1 space-y-1">
                        {milestones.map((milestone, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium">{milestone.name}</span> ({milestone.date})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mt-4">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    Po utworzeniu projektu, oryginalna karta pozostanie na tablicy Kanban i będzie powiązana z projektem.
                    Możesz później dodawać więcej zadań do projektu.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Przyciski akcji */}
          <div className="flex justify-between items-center p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            {step > 1 ? (
              <button
                onClick={prevStep}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors"
              >
                Wróć
              </button>
            ) : (
              <div></div>
            )}
            
            {step < 4 ? (
              <button
                onClick={nextStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Dalej
              </button>
            ) : (
              <button
                onClick={createProjectFromCard}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Utwórz projekt
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CardToProjectDialog;