document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll Progress Bar & Navbar Styling
    const scrollIndicator = document.getElementById('scrollIndicator');
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        // Calculate scroll percentage
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if (scrollIndicator) {
            scrollIndicator.style.width = scrolled + '%';
        }

        // Toggle scrolled class on navbar
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 1.5 Mobile Navigation Toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-links');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isOpen);
            navToggle.textContent = isOpen ? '✕' : '☰';
        });

        // 메뉴 링크 클릭 시 자동으로 닫기
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.textContent = '☰';
            });
        });
    }

    // 2. Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 3. Reveal Elements on Scroll & Animate Skill Bars
    const revealElements = document.querySelectorAll('.reveal');
    const skillBars = document.querySelectorAll('.vis-bar-fill');
    
    // Set initially empty width for skill bars to trigger animation on scroll
    skillBars.forEach(bar => {
        const finalWidth = bar.style.width;
        bar.style.width = '0%';
        bar.dataset.finalWidth = finalWidth;
    });

    const observerOptions = {
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px'
    };

    try {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    
                    // If it's the capability section, animate skill bars
                    if (entry.target.id === 'analytics') {
                        animateSkillBars();
                    }
                    
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealElements.forEach(el => {
            revealObserver.observe(el);
        });
    } catch (e) {
        console.warn('IntersectionObserver not supported, activating all reveal elements immediately.', e);
        revealElements.forEach(el => {
            el.classList.add('active');
        });
        animateSkillBars();
    }

    // Fallback: 1.2초 후에 아직 active가 안 된 모든 reveal 요소를 강제로 표시
    setTimeout(() => {
        revealElements.forEach(el => {
            if (!el.classList.contains('active')) {
                el.classList.add('active');
                
                if (el.id === 'analytics') {
                    animateSkillBars();
                }
            }
        });
    }, 1200);

    function animateSkillBars() {
        skillBars.forEach(bar => {
            const width = bar.dataset.finalWidth;
            setTimeout(() => {
                bar.style.width = width;
            }, 100);
        });
    }

    // 4. Hero Gradient Shift Animation for .highlight text
    const highlightEl = document.querySelector('.hero-content .highlight');
    if (highlightEl) {
        highlightEl.style.backgroundSize = '200% auto';
        highlightEl.style.animation = 'gradientShift 4s ease infinite';
    }

    // 4.5 KPI Count-Up Animation
    function animateCountUp(el, targetText) {
        // 숫자만 추출 (예: "470명" → 470, "5년차" → 5, "60% ➔ 25%" → skip)
        const match = targetText.match(/^([\d,]+)/);
        if (!match) return; // 범위 값은 건너뛰기

        const targetNum = parseInt(match[1].replace(/,/g, ''));
        const suffix = targetText.replace(match[1], '');
        const duration = 1500;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutExpo
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = Math.round(eased * targetNum);
            el.textContent = current.toLocaleString('ko-KR') + suffix;
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    const kpiVals = document.querySelectorAll('.kpi-val');
    if (kpiVals.length > 0) {
        const kpiTargets = [];
        kpiVals.forEach(el => {
            kpiTargets.push(el.textContent);
            // 범위 값(예: 60% ➔ 25%)은 그대로 유지
            if (!el.classList.contains('range')) {
                el.textContent = '0';
            }
        });

        // 히어로 섹션이 보이면 카운트업 시작
        const heroSection = document.getElementById('home');
        if (heroSection) {
            const kpiObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        kpiVals.forEach((el, i) => {
                            if (!el.classList.contains('range')) {
                                animateCountUp(el, kpiTargets[i]);
                            }
                        });
                        kpiObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });
            kpiObserver.observe(heroSection);
        }
    }

    // 5. Interactive People Analytics - Wage Simulator Logic
    function initWageSimulator() {
        const baseSalaryInput = document.getElementById('baseSalary');
        const baseSalaryNum = document.getElementById('baseSalaryNum');
        const overtimeHoursInput = document.getElementById('overtimeHours');
        const overtimeHoursNum = document.getElementById('overtimeHoursNum');
        const headcountInput = document.getElementById('headcount');
        const headcountNum = document.getElementById('headcountNum');
        
        const btnPeriodMonthly = document.getElementById('btnPeriodMonthly');
        const btnPeriodYearly = document.getElementById('btnPeriodYearly');
        
        const allowanceBonus = document.getElementById('allowanceBonus');
        const allowanceMeal = document.getElementById('allowanceMeal');
        const allowanceHoliday = document.getElementById('allowanceHoliday');
        const allowanceVacation = document.getElementById('allowanceVacation');
        const allowanceTrans = document.getElementById('allowanceTrans');
        
        const hourlyWageEl = document.getElementById('hourlyWage');
        const overtimePayEl = document.getElementById('overtimePay');
        const beforeHourlyEl = document.getElementById('beforeHourly');
        const beforeOvertimeEl = document.getElementById('beforeOvertime');
        const diffHourlyEl = document.getElementById('diffHourly');
        const diffOvertimeEl = document.getElementById('diffOvertime');
        
        const totalCostEl = document.getElementById('totalCost');
        const baselineTotalCostEl = document.getElementById('baselineTotalCost');
        const deltaPercentEl = document.getElementById('deltaPercent');
        const deltaBarFill = document.getElementById('deltaBarFill');
        const deltaBarPercent = document.getElementById('deltaBarPercent');
        
        // Labels
        const labelOvertimePeriod = document.getElementById('labelOvertimePeriod');
        const labelTotalCostPeriod = document.getElementById('labelTotalCostPeriod');
        const labelBaselineCostPeriod = document.getElementById('labelBaselineCostPeriod');
        const descOvertime = document.getElementById('descOvertime');
        
        // Formula panel elements
        const fBaseSalary = document.getElementById('f-baseSalary');
        const fAllowances = document.getElementById('f-allowances');
        const fHourlyWage = document.getElementById('f-hourlyWage');
        const fHourlyWageMultiplier = document.getElementById('f-hourlyWageMultiplier');
        const fOvertimeHours = document.getElementById('f-overtimeHours');
        const fOvertimePay = document.getElementById('f-overtimePay');
        const fTotalBase = document.getElementById('f-totalBase');
        const fTotalOvertime = document.getElementById('f-totalOvertime');
        const fTotalCost = document.getElementById('f-totalCost');
        const fTotalAllowances = document.getElementById('f-totalAllowances');
        
        const fHeadcount = document.getElementById('f-headcount');
        const fPeriodMultiplier = document.getElementById('f-periodMultiplier');
        const fTotalHeadcount = document.getElementById('f-totalHeadcount');
        const fTotalPeriodMultiplier = document.getElementById('f-totalPeriodMultiplier');
        
        const riskGreen = document.getElementById('riskGreen');
        const riskYellow = document.getElementById('riskYellow');
        const riskRed = document.getElementById('riskRed');
        const riskStatus = document.getElementById('riskStatus');
        const riskComment = document.getElementById('riskComment');

        let currentPeriod = 'monthly'; // 'monthly' or 'yearly'

        if (!baseSalaryInput || !overtimeHoursInput) return;

        // Ensure values are initialized in sync (e.g. on browser refresh/back cache)
        if (baseSalaryNum) baseSalaryNum.value = parseInt(baseSalaryInput.value).toLocaleString('ko-KR');
        if (overtimeHoursNum) overtimeHoursNum.value = overtimeHoursInput.value;
        if (headcountNum && headcountInput) headcountNum.value = headcountInput.value;

        // Wage Constants
        const BONUS_AMT = 2000000;
        const MEAL_AMT = 200000;
        const HOLIDAY_AMT = 1000000;
        const VACATION_AMT = 800000;
        const TRANS_AMT = 100000;

        function formatNumber(num) {
            return Math.round(num).toLocaleString('ko-KR');
        }

        function updateSimulation() {
            const baseSalary = parseInt(baseSalaryInput.value);
            const overtimeHours = parseInt(overtimeHoursInput.value);
            const headcount = headcountInput ? parseInt(headcountInput.value) : 470;
            const isYearly = currentPeriod === 'yearly';
            const periodFactor = isYearly ? 12 : 1;
            
            // Calculate allowances included in ordinary wage (Separated into Annual and Monthly)
            let includedAnnual = 0;
            let includedMonthly = 0;
            if (allowanceBonus && allowanceBonus.checked) includedAnnual += BONUS_AMT;
            if (allowanceHoliday && allowanceHoliday.checked) includedAnnual += HOLIDAY_AMT;
            if (allowanceVacation && allowanceVacation.checked) includedAnnual += VACATION_AMT;
            
            if (allowanceMeal && allowanceMeal.checked) includedMonthly += MEAL_AMT;
            if (allowanceTrans && allowanceTrans.checked) includedMonthly += TRANS_AMT;
            
            // 월 단위 포함 수당 기초액 = (연간수당 합산 / 12) + 월간수당 합산
            const includedAllowances = (includedAnnual / 12) + includedMonthly;
            
            // 1. Calculate Hourly Wage (시급) = (Base + Included Allowances) / 209 (원 단위 반올림하여 정수화)
            const hourlyWage = Math.round((baseSalary + includedAllowances) / 209);
            
            // 2. Calculate Overtime Pay = Hourly Wage * Overtime Hours * 1.5 * headcount * periodFactor
            // 1인당 연장근로수당을 먼저 원 단위 반올림하여 정수화
            const overtimePaySingle = Math.round(hourlyWage * overtimeHours * 1.5);
            const overtimePay = overtimePaySingle * headcount * periodFactor;
            
            // 실제 월 평균 고정수당 총합 (연간수당은 1/12로 평균화하여 월 비용에 반영 - 원 단위 반올림)
            const actualMonthlyAllowancesPaid = Math.round(((BONUS_AMT + HOLIDAY_AMT + VACATION_AMT) / 12) + MEAL_AMT + TRANS_AMT);
            
            // 3. Calculate Total Cost = (Base + 월평균실제고정수당 + Overtime Pay Single) * headcount * periodFactor
            const totalCost = (baseSalary + actualMonthlyAllowancesPaid + overtimePaySingle) * headcount * periodFactor;
            
            // 4. Calculate Baseline Cost (변경 전 기존 임금체계 기준)
            const baselineHourly = Math.round(baseSalary / 209);
            const baselineOvertimeSingle = Math.round(baselineHourly * overtimeHours * 1.5);
            const baselineOvertime = baselineOvertimeSingle * headcount * periodFactor;
            const baselineTotal = (baseSalary + actualMonthlyAllowancesPaid + baselineOvertimeSingle) * headcount * periodFactor;
            
            // 5. Calculate Cost Delta % due to Ordinary Wage expansion
            const costDifference = totalCost - baselineTotal;
            const deltaPercent = baselineTotal > 0 ? (costDifference / baselineTotal) * 100 : 0;
            
            // Update results in DOM
            hourlyWageEl.textContent = formatNumber(hourlyWage);
            overtimePayEl.textContent = formatNumber(overtimePay);
            if (beforeHourlyEl) beforeHourlyEl.textContent = formatNumber(baselineHourly);
            if (beforeOvertimeEl) beforeOvertimeEl.textContent = formatNumber(baselineOvertime);
            if (diffHourlyEl) {
                const diffHourly = hourlyWage - baselineHourly;
                diffHourlyEl.textContent = '(+' + formatNumber(diffHourly) + '원)';
            }
            if (diffOvertimeEl) {
                const diffOvertime = overtimePay - baselineOvertime;
                diffOvertimeEl.textContent = '(+' + formatNumber(diffOvertime) + '원)';
            }
            if (baselineTotalCostEl) baselineTotalCostEl.textContent = formatNumber(baselineTotal);
            
            // Update dynamic titles
            if (labelOvertimePeriod) labelOvertimePeriod.textContent = isYearly ? '(연간 총합)' : '(월간 총합)';
            if (labelTotalCostPeriod) labelTotalCostPeriod.textContent = isYearly ? '(연간 총합)' : '(월간 총합)';
            if (labelBaselineCostPeriod) labelBaselineCostPeriod.textContent = isYearly ? '(연간 총합)' : '(월간 총합)';
            if (descOvertime) descOvertime.textContent = headcount + '명 대상 연장근로 ' + (isYearly ? '연간' : '월간') + ' 총합';
            
            // Update formula panel in DOM
            if (fBaseSalary) fBaseSalary.textContent = formatNumber(baseSalary);
            if (fAllowances) fAllowances.textContent = formatNumber(includedAllowances);
            
            const formulaBreakdownEl = document.getElementById('formulaBreakdown');
            if (formulaBreakdownEl) {
                const breakdownParts = [];
                if (allowanceMeal && allowanceMeal.checked) breakdownParts.push("식대 20만");
                if (allowanceTrans && allowanceTrans.checked) breakdownParts.push("교통 10만");
                if (allowanceBonus && allowanceBonus.checked) breakdownParts.push("상여 16.7만");
                if (allowanceHoliday && allowanceHoliday.checked) breakdownParts.push("명절 8.3만");
                if (allowanceVacation && allowanceVacation.checked) breakdownParts.push("휴가 6.7만");
                formulaBreakdownEl.textContent = breakdownParts.length > 0 ? `(${breakdownParts.join(' + ')})` : '(산입 수당 없음)';
            }
            if (fHourlyWage) fHourlyWage.textContent = formatNumber(hourlyWage);
            if (fHourlyWageMultiplier) fHourlyWageMultiplier.textContent = formatNumber(hourlyWage);
            if (fOvertimeHours) fOvertimeHours.textContent = overtimeHours;
            if (fOvertimePay) fOvertimePay.textContent = formatNumber(overtimePay);
            if (fTotalBase) fTotalBase.textContent = formatNumber(baseSalary);
            if (fTotalOvertime) fTotalOvertime.textContent = formatNumber(overtimePaySingle * periodFactor);
            if (fTotalCost) fTotalCost.textContent = formatNumber(totalCost);
            if (fTotalAllowances) fTotalAllowances.textContent = formatNumber(actualMonthlyAllowancesPaid * periodFactor);
            
            if (fHeadcount) fHeadcount.textContent = headcount;
            if (fPeriodMultiplier) fPeriodMultiplier.textContent = isYearly ? ' * 12개월' : '';
            if (fTotalHeadcount) fTotalHeadcount.textContent = headcount;
            if (fTotalPeriodMultiplier) fTotalPeriodMultiplier.textContent = isYearly ? ' * 12개월' : '';
            
            totalCostEl.textContent = formatNumber(totalCost);
            
            // 상승률과 절대 차액을 병합하여 단일 배지에 표기 (+2.5% (+51,722,490원))
            const sign = deltaPercent >= 0 ? '+' : '';
            const percentStr = sign + deltaPercent.toFixed(1) + '%';
            const diffAmtStr = sign + formatNumber(costDifference) + '원';
            deltaPercentEl.textContent = percentStr + ' (' + diffAmtStr + ')';
            
            if (deltaBarPercent) {
                deltaBarPercent.textContent = deltaPercent.toFixed(1) + '%';
            }
            
            // Update Cost Delta Bar
            // Max bar representation set to 25% for visualization scaling
            const barPercentage = Math.min((deltaPercent / 25) * 100, 100);
            deltaBarFill.style.width = barPercentage + '%';
            
            // 6. Legal Risk Indicator Logic (Based on 정기상여, 식대, 교통비, 명절비, 휴가비)
            riskGreen.classList.remove('active');
            riskYellow.classList.remove('active');
            riskRed.classList.remove('active');
            
            const isBonusChecked = allowanceBonus ? allowanceBonus.checked : false;
            const isMealChecked = allowanceMeal ? allowanceMeal.checked : false;
            const isTransChecked = allowanceTrans ? allowanceTrans.checked : false;
            const isHolidayChecked = allowanceHoliday ? allowanceHoliday.checked : false;
            const isVacationChecked = allowanceVacation ? allowanceVacation.checked : false;

            if (!isBonusChecked || !isMealChecked || !isTransChecked) {
                // High Risk (Regular bonus, meal, or uniform transport excluded)
                riskRed.classList.add('active');
                riskStatus.textContent = '위험 (High)';
                riskStatus.style.color = '#ef4444';
                riskComment.textContent = '정기상여, 식대, 일률지급 교통비는 대법원 판례상 통상임금성이 100% 인정됩니다. 산정 제외 시 법적 분쟁에서 패소 및 소송 리스크가 발생합니다.';
            } else if (!isHolidayChecked || !isVacationChecked) {
                // Caution (Contentious allowances excluded like holiday/vacation with conditional employment clauses)
                riskYellow.classList.add('active');
                riskStatus.textContent = '주의 (Caution)';
                riskStatus.style.color = '#f59e0b';
                riskComment.textContent = '명절비와 휴가비는 재직 조건(지급일 기준 재직자 대상 등) 유무에 따라 통상임금 배제 여부가 결정되는 대표적 쟁점 수당입니다. 규칙 점검이 권장됩니다.';
            } else {
                // Safe (All allowances included)
                riskGreen.classList.add('active');
                riskStatus.textContent = '안전 (Safe)';
                riskStatus.style.color = 'var(--emerald)';
                riskComment.textContent = '모든 고정성 수당을 통상임금에 포함시켜 근로 분쟁 소지가 원천 차단되었습니다. 총인건비 증가에 따른 사업예산 조정이 필요합니다.';
            }
        }

        // Bi-directional synchronization for Base Salary with thousands separators
        if (baseSalaryInput && baseSalaryNum) {
            baseSalaryInput.addEventListener('input', () => {
                let val = parseInt(baseSalaryInput.value);
                baseSalaryNum.value = val.toLocaleString('ko-KR');
                updateSimulation();
            });
            
            baseSalaryNum.addEventListener('input', () => {
                // Get current value and cursor position
                let rawValue = baseSalaryNum.value;
                let cursorPosition = baseSalaryNum.selectionStart;
                let originalLength = rawValue.length;

                // Remove all non-digits
                let cleanValue = rawValue.replace(/[^0-9]/g, '');
                
                if (cleanValue === '') {
                    baseSalaryNum.value = '';
                    updateSimulation();
                    return;
                }
                
                let numValue = parseInt(cleanValue);
                
                // Format with commas
                let formattedValue = numValue.toLocaleString('ko-KR');
                baseSalaryNum.value = formattedValue;

                // Adjust cursor position to handle inserted/removed commas
                let newLength = formattedValue.length;
                let cursorOffset = newLength - originalLength;
                let newCursorPosition = cursorPosition + cursorOffset;
                
                // Keep cursor position in bounds
                if (newCursorPosition < 0) newCursorPosition = 0;
                if (newCursorPosition > newLength) newCursorPosition = newLength;
                
                baseSalaryNum.setSelectionRange(newCursorPosition, newCursorPosition);

                // Sync to slider
                const min = parseInt(baseSalaryInput.min);
                const max = parseInt(baseSalaryInput.max);
                if (numValue >= min && numValue <= max) {
                    baseSalaryInput.value = numValue;
                }
                updateSimulation();
            });

            baseSalaryNum.addEventListener('blur', () => {
                let rawValue = baseSalaryNum.value;
                let cleanValue = rawValue.replace(/[^0-9]/g, '');
                let val = parseInt(cleanValue);
                const min = parseInt(baseSalaryInput.min);
                const max = parseInt(baseSalaryInput.max);
                
                if (isNaN(val) || val < min) {
                    val = min;
                } else if (val > max) {
                    val = max;
                }
                
                baseSalaryNum.value = val.toLocaleString('ko-KR');
                baseSalaryInput.value = val;
                updateSimulation();
            });
        }

        // Bi-directional synchronization for Overtime Hours
        if (overtimeHoursInput && overtimeHoursNum) {
            overtimeHoursInput.addEventListener('input', () => {
                overtimeHoursNum.value = overtimeHoursInput.value;
                updateSimulation();
            });

            overtimeHoursNum.addEventListener('input', () => {
                let val = parseInt(overtimeHoursNum.value);
                if (!isNaN(val)) {
                    const min = parseInt(overtimeHoursNum.min);
                    const max = parseInt(overtimeHoursNum.max);
                    if (val >= min && val <= max) {
                        overtimeHoursInput.value = val;
                    }
                    updateSimulation();
                }
            });

            overtimeHoursNum.addEventListener('blur', () => {
                let val = parseInt(overtimeHoursNum.value);
                const min = parseInt(overtimeHoursNum.min);
                const max = parseInt(overtimeHoursNum.max);
                if (isNaN(val) || val < min) {
                    val = min;
                } else if (val > max) {
                    val = max;
                }
                overtimeHoursNum.value = val;
                overtimeHoursInput.value = val;
                updateSimulation();
            });
        }

        // Bi-directional synchronization for Headcount
        if (headcountInput && headcountNum) {
            headcountInput.addEventListener('input', () => {
                headcountNum.value = headcountInput.value;
                updateSimulation();
            });

            headcountNum.addEventListener('input', () => {
                let val = parseInt(headcountNum.value);
                if (!isNaN(val)) {
                    const min = parseInt(headcountNum.min);
                    const max = parseInt(headcountNum.max);
                    if (val >= min && val <= max) {
                        headcountInput.value = val;
                    }
                    updateSimulation();
                }
            });

            headcountNum.addEventListener('blur', () => {
                let val = parseInt(headcountNum.value);
                const min = parseInt(headcountNum.min);
                const max = parseInt(headcountNum.max);
                if (isNaN(val) || val < min) {
                    val = min;
                } else if (val > max) {
                    val = max;
                }
                headcountNum.value = val;
                headcountInput.value = val;
                updateSimulation();
            });
        }
        
        if (allowanceBonus) allowanceBonus.addEventListener('change', updateSimulation);
        if (allowanceMeal) allowanceMeal.addEventListener('change', updateSimulation);
        if (allowanceHoliday) allowanceHoliday.addEventListener('change', updateSimulation);
        if (allowanceVacation) allowanceVacation.addEventListener('change', updateSimulation);
        if (allowanceTrans) allowanceTrans.addEventListener('change', updateSimulation);

        if (btnPeriodMonthly && btnPeriodYearly) {
            btnPeriodMonthly.addEventListener('click', () => {
                currentPeriod = 'monthly';
                btnPeriodMonthly.classList.add('active');
                btnPeriodYearly.classList.remove('active');
                updateSimulation();
            });
            
            btnPeriodYearly.addEventListener('click', () => {
                currentPeriod = 'yearly';
                btnPeriodYearly.classList.add('active');
                btnPeriodMonthly.classList.remove('active');
                updateSimulation();
            });
        }

        // Run initial simulation
        updateSimulation();
    }


    // Initialize Simulator
    initWageSimulator();



    // 6. Clipboard Copy with Premium Micro-Animation for Email
    const emailBox = document.getElementById('emailBox');
    const toastMsg = document.getElementById('toastMsg');

    if (emailBox && toastMsg) {
        emailBox.addEventListener('click', () => {
            const emailAddress = emailBox.querySelector('.email-address').textContent;
            
            navigator.clipboard.writeText(emailAddress).then(() => {
                // Trigger Copied Micro-Animation
                emailBox.classList.add('copied');
                toastMsg.classList.add('show');
                
                setTimeout(() => {
                    emailBox.classList.remove('copied');
                }, 800);
                
                setTimeout(() => {
                    toastMsg.classList.remove('show');
                }, 2000);
            }).catch(err => {
                console.error('Could not copy text: ', err);
            });
        });
    }

    // 7. Scroll Spy for Navigation Links
    const sections = document.querySelectorAll('header[id], section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    function scrollSpy() {
        const fromTop = window.scrollY + navbar.offsetHeight + 100;
        
        sections.forEach(sec => {
            const id = sec.getAttribute('id');
            const top = sec.offsetTop;
            const height = sec.offsetHeight;
            
            if (fromTop >= top && fromTop < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', scrollSpy);
    // Run once on load to highlight current section
    scrollSpy();

    // 8. 10-Second Quick Coffee Chat Proposal Form real mailto engine
    const coffeeChatForm = document.getElementById('coffeeChatForm');
    const chatSuccessPanel = document.getElementById('chatSuccessPanel');
    const btnSubmitChat = document.getElementById('btnSubmitChat');
    const btnResetChat = document.getElementById('btnResetChat');
    
    if (coffeeChatForm && chatSuccessPanel && btnSubmitChat) {
        coffeeChatForm.addEventListener('submit', e => {
            e.preventDefault();
            
            const btnText = btnSubmitChat.querySelector('.btn-text');
            const btnSpinner = btnSubmitChat.querySelector('.btn-spinner');
            
            // Show Spinner / Processing Status
            if (btnText && btnSpinner) {
                btnText.style.display = 'none';
                btnSpinner.style.display = 'inline-block';
                btnSubmitChat.disabled = true;
            }
            
            // Mock processing delay (1.2 seconds) before triggering mailto
            setTimeout(() => {
                // Extract values
                const sender = document.getElementById('chatSender').value;
                const contact = document.getElementById('chatContact').value;
                const purpose = document.getElementById('chatPurpose').value;
                const message = document.getElementById('chatMessage').value;
                
                // Format subject and body for the email draft
                const subject = `[커피챗 제안] ${purpose} - ${sender}님`;
                const body = `안녕하세요, 김민수님.\n\n포트폴리오를 통해 커피챗을 제안합니다.\n\n[제안 정보]\n- 제안 목적: ${purpose}\n- 제안자: ${sender}\n- 연락처/이메일: ${contact}\n\n[제안 메시지]\n${message}\n\n감사합니다.`;
                
                // Hide form and show success panel with smooth transit
                coffeeChatForm.style.display = 'none';
                chatSuccessPanel.style.display = 'flex';
                chatSuccessPanel.style.opacity = '0';
                chatSuccessPanel.style.animation = 'fadeIn 0.5s ease forwards';
                
                // Reset submit button state
                if (btnText && btnSpinner) {
                    btnText.style.display = 'inline-block';
                    btnSpinner.style.display = 'none';
                    btnSubmitChat.disabled = false;
                }

                // Trigger mailto client
                const mailtoUrl = `mailto:jopss1001@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                window.location.href = mailtoUrl;
            }, 1200);
        });
    }
    
    if (btnResetChat && coffeeChatForm && chatSuccessPanel) {
        btnResetChat.addEventListener('click', () => {
            // Reset fields
            coffeeChatForm.reset();
            
            // Switch back to form panel
            chatSuccessPanel.style.display = 'none';
            coffeeChatForm.style.display = 'flex';
            coffeeChatForm.style.opacity = '0';
            coffeeChatForm.style.animation = 'fadeIn 0.5s ease forwards';
        });
    }

    const btnCopySuccessEmail = document.getElementById('btnCopySuccessEmail');
    if (btnCopySuccessEmail) {
        btnCopySuccessEmail.addEventListener('click', () => {
            navigator.clipboard.writeText('jopss1001@gmail.com').then(() => {
                const originalText = btnCopySuccessEmail.textContent;
                btnCopySuccessEmail.textContent = '복사 완료 ✓';
                btnCopySuccessEmail.style.backgroundColor = 'var(--emerald)';
                btnCopySuccessEmail.style.borderColor = 'var(--emerald)';
                setTimeout(() => {
                    btnCopySuccessEmail.textContent = originalText;
                    btnCopySuccessEmail.style.backgroundColor = '';
                    btnCopySuccessEmail.style.borderColor = '';
                }, 2000);
            });
        });
    }

    // 9. Interactive Mouse Tracking Radial Glow for Glass Cards
    const glassCards = document.querySelectorAll('.glass-card, .competency-card, .achievement-card, .edu-dash-card');
    
    glassCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });


});


