using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace AttackSimulation.Controllers
{
    public class AttackSimulationController : Controller
    {
        public IActionResult Index(int n = 100, int m = 50, double p = 0.7)
        {
            // Simulate attacks
            Random rand = new Random();
            bool[,] penetrations = new bool[m, n];
            int[] penetrationLevels = new int[m];
            for (int i = 0; i < m; i++)
            {
                int level = 0;
                for (int j = 0; j < n; j++)
                {
                    penetrations[i, j] = rand.NextDouble() < p;
                    if (penetrations[i, j])
                    {
                        level++;
                    }
                }
                penetrationLevels[i] = level;
            }

            // Count levels
            int[] levelCounts = new int[n + 1];
            foreach (int level in penetrationLevels)
            {
                levelCounts[level]++;
            }

            // Calculate relative and absolute frequency success
            double[] relativeFrequency = new double[n + 1];
            int[] absoluteFrequency = new int[n + 1];
            for (int i = 0; i <= n; i++)
            {
                absoluteFrequency[i] = levelCounts[i];
                relativeFrequency[i] = (double)levelCounts[i] / m;
            }

            // Calculate average penetration level
            double averagePenetrationLevel = penetrationLevels.Average();
            double variancePenetrationLevel = penetrationLevels.Select(x => Math.Pow(x - averagePenetrationLevel, 2)).Average();

            ViewBag.RelativeFrequency = relativeFrequency;
            ViewBag.AbsoluteFrequency = absoluteFrequency;
            ViewBag.PenetrationPaths = penetrations;
            ViewBag.N = n;
            ViewBag.M = m;
            ViewBag.P = p;
            ViewBag.AveragePenetrationLevel = averagePenetrationLevel;
            ViewBag.VariancePenetrationLevel = variancePenetrationLevel;

            // Calculate intermediate distributions
            var intermediateDistributions = CalculateIntermediateDistributions(penetrations, n, m);
            ViewBag.IntermediateDistributions = intermediateDistributions;

            return View();
        }

        private Dictionary<int, (double mean, double variance)> CalculateIntermediateDistributions(bool[,] penetrations, int n, int m)
        {
            var distributions = new Dictionary<int, (double mean, double variance)>();
            for (int t = 1; t < n; t++)
            {
                double[] levelsAtT = new double[m];
                for (int i = 0; i < m; i++)
                {
                    levelsAtT[i] = penetrations.Cast<bool>().Take(t).Count(p => p);
                }
                double mean = levelsAtT.Average();
                double variance = levelsAtT.Select(x => Math.Pow(x - mean, 2)).Average();
                distributions[t] = (mean, variance);
            }
            return distributions;
        }
    }
}